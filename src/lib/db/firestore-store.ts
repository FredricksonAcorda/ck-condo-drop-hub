import { IDatabaseService } from "./db-interface";
import {
  Parcel,
  CreateParcelInput,
  ResidentProfile,
  AuthUser,
  ActivityLogItem,
  SmsLogItem,
  HubSettings,
  DeskInquiry,
  InquiryStatus,
} from "@/types";
import { firestore, isFirebaseConfigured } from "../firebase/config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import {
  SEED_PARCELS,
  SEED_RESIDENTS,
  SEED_USERS,
  SEED_ACTIVITY_LOGS,
  SEED_SMS_LOGS,
  DEFAULT_HUB_SETTINGS,
  SEED_INQUIRIES,
} from "./seed-data";

/**
 * Normalizes any Philippine or international phone number to its core digits (last 10 digits for PH mobile).
 * Ensures matching works seamlessly whether stored as "+63 9XX", "09XX", or "9XX".
 */
export function normalizePhone(rawPhone?: string): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Recursively strips any keys whose value is undefined.
 * Firestore strictly rejects undefined field values at the SDK level.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

function notifyLocalUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ck_db_updated"));
  }
}

export class FirestoreDatabaseService implements IDatabaseService {
  private seeded = false;

  private isDemoUser(id?: string, name?: string): boolean {
    return (
      id === "usr-resident-1" ||
      id === "usr-resident-2" ||
      name === "Juan Dela Cruz" ||
      name === "Maria Santos"
    );
  }

  private async ensureSeeded(): Promise<void> {
    if (!firestore || this.seeded) return;
    try {
      // Check if parcels collection exists
      const parcelsSnap = await getDocs(query(collection(firestore, "parcels"), limit(1)));
      if (parcelsSnap.empty) {
        // Seed Parcels (excluding demo)
        for (const p of SEED_PARCELS) {
          if (!this.isDemoUser(p.residentId, p.residentName)) {
            await setDoc(doc(firestore, "parcels", p.id), p);
          }
        }
      }

      // Check residents collection
      const residentsSnap = await getDocs(query(collection(firestore, "residents"), limit(1)));
      if (residentsSnap.empty) {
        for (const r of SEED_RESIDENTS) {
          if (!this.isDemoUser(r.id, r.name)) {
            await setDoc(doc(firestore, "residents", r.id), r);
          }
        }
      }

      // Check users collection
      const usersSnap = await getDocs(query(collection(firestore, "users"), limit(1)));
      if (usersSnap.empty) {
        for (const u of SEED_USERS) {
          if (!this.isDemoUser(u.id, u.name)) {
            await setDoc(doc(firestore, "users", u.id), u);
          }
        }
      }

      // Check settings doc
      const settingsDoc = await getDoc(doc(firestore, "settings", "default"));
      if (!settingsDoc.exists()) {
        await setDoc(doc(firestore, "settings", "default"), DEFAULT_HUB_SETTINGS);
      }

      // Check activity logs
      const actSnap = await getDocs(query(collection(firestore, "activity_logs"), limit(1)));
      if (actSnap.empty) {
        for (const a of SEED_ACTIVITY_LOGS) {
          await setDoc(doc(firestore, "activity_logs", a.id), a);
        }
      }

      // Check SMS logs
      const smsSnap = await getDocs(query(collection(firestore, "sms_logs"), limit(1)));
      if (smsSnap.empty) {
        for (const s of SEED_SMS_LOGS) {
          await setDoc(doc(firestore, "sms_logs", s.id), s);
        }
      }

      // Check inquiries
      const inqSnap = await getDocs(query(collection(firestore, "inquiries"), limit(1)));
      if (inqSnap.empty) {
        for (const i of SEED_INQUIRIES) {
          await setDoc(doc(firestore, "inquiries", i.id), i);
        }
      }

      this.seeded = true;
    } catch (err) {
      console.warn("Firestore auto-seed notice (may already exist or offline):", err);
    }
  }

  // --- Parcels ---

  async getAllParcels(): Promise<Parcel[]> {
    if (!firestore) return SEED_PARCELS.filter((p) => !this.isDemoUser(p.residentId, p.residentName));
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(firestore, "parcels"));
      if (snap.empty) return SEED_PARCELS.filter((p) => !this.isDemoUser(p.residentId, p.residentName));
      return snap.docs
        .map((d) => d.data() as Parcel)
        .filter((p) => !this.isDemoUser(p.residentId, p.residentName));
    } catch (err) {
      console.error("Error fetching parcels from Firestore:", err);
      return SEED_PARCELS.filter((p) => !this.isDemoUser(p.residentId, p.residentName));
    }
  }

  async getParcelsByResident(residentId: string): Promise<Parcel[]> {
    if (!firestore) return SEED_PARCELS.filter((p) => p.residentId === residentId);
    await this.ensureSeeded();
    try {
      const q = query(collection(firestore, "parcels"), where("residentId", "==", residentId));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as Parcel);
    } catch (err) {
      console.error("Error fetching resident parcels:", err);
      return (await this.getAllParcels()).filter((p) => p.residentId === residentId);
    }
  }

  async getParcelByTracking(trackingNumber: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const cleanSearch = trackingNumber.trim().toUpperCase();
    return all.find((p) => p.trackingNumber.toUpperCase() === cleanSearch) || null;
  }

  async createParcel(input: CreateParcelInput): Promise<Parcel> {
    const residents = await this.getAllResidents();
    const resident = residents.find((r) => r.id === input.residentId);
    const settings = await this.getHubSettings();

    const courierColors: Record<string, string> = {
      "SPX Express": "#EE4D2D",
      "Flash Express": "#FFB800",
      "J&T Express": "#D21F1F",
      "YTO Express": "#592780",
      "LBC Express": "#E31837",
      "STO Express": "#FF6600",
      "Other Courier": "#6B7280",
    };

    const courierColor = courierColors[input.courier] || "#6B7280";
    const now = new Date();
    const dateArrivedStr =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const freeDays = resident?.plan === "PREMIUM" ? settings.freeDaysPremium : settings.freeDaysRegular;
    const deadlineDate = new Date(now.getTime() + freeDays * 24 * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const claimCode = `CK-${randomSuffix}`;

    const newParcel: Parcel = {
      id: `pcl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      trackingNumber: input.trackingNumber.trim().toUpperCase(),
      courier: input.courier,
      courierColor,
      residentId: input.residentId,
      residentName: input.residentName,
      unit: input.unit,
      shelf: input.shelf,
      size: input.size || "Medium",
      dateArrived: dateArrivedStr,
      deadline: deadlineStr,
      holdingFee: "₱0.00 (Free)",
      status: "READY",
      claimCode,
      notes: input.notes,
    };

    if (firestore) {
      await setDoc(doc(firestore, "parcels", newParcel.id), sanitizeForFirestore(newParcel));
    }

    if (resident) {
      await this.updateResidentProfile(resident.id, {
        activeParcelsCount: (resident.activeParcelsCount || 0) + 1,
        totalParcelsReceived: (resident.totalParcelsReceived || 0) + 1,
      });
    }

    await this.recordActivity({
      type: "PARCEL_INGESTED",
      title: `Parcel Ingested: ${newParcel.trackingNumber}`,
      description: `Ingested from ${newParcel.courier} for ${newParcel.residentName} (${newParcel.unit}). Assigned to ${newParcel.shelf}.`,
      actor: settings.stationName,
      trackingNumber: newParcel.trackingNumber,
      residentId: newParcel.residentId,
      badgeColor: "bg-orange-500",
    });

    const wantsSms = resident?.notifications?.smsArrival ?? true;
    if (resident?.phone && wantsSms) {
      const smsMessage = `${settings.hubName}: Package ${newParcel.trackingNumber} from ${newParcel.courier} has arrived at ${newParcel.shelf}. Claim passcode: ${newParcel.claimCode}. Free holding until ${newParcel.deadline}.`;
      await this.recordSms({
        recipientPhone: resident.phone,
        recipientName: resident.name,
        messageText: smsMessage,
        status: "DELIVERED",
        trackingNumber: newParcel.trackingNumber,
        costEstimate: "₱0.40",
      });
    }

    notifyLocalUpdate();
    return newParcel;
  }

  async verifyClaimCode(claimCode: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const clean = claimCode.trim().toUpperCase();
    const match = all.find((p) => p.claimCode.toUpperCase() === clean && p.status !== "PICKED_UP") || null;

    if (match) {
      await this.recordActivity({
        type: "CLAIM_VERIFIED",
        title: `Claim Verified: ${match.claimCode}`,
        description: `Passcode verified for ${match.residentName} (${match.unit}) for package ${match.trackingNumber}.`,
        actor: "Lobby Staff Admin",
        trackingNumber: match.trackingNumber,
        badgeColor: "bg-blue-600",
      });
    }

    return match;
  }

  async releaseParcel(parcelId: string, claimedBy: string): Promise<Parcel> {
    const all = await this.getAllParcels();
    const target = all.find((p) => p.id === parcelId);
    if (!target) throw new Error("Parcel not found");

    const settings = await this.getHubSettings();
    const now = new Date();
    const claimedAtStr =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const updated: Parcel = {
      ...target,
      status: "PICKED_UP",
      shelf: "Archived (Released)",
      claimedAt: claimedAtStr,
      claimedBy: claimedBy.trim() || "Resident",
    };

    if (firestore) {
      await updateDoc(doc(firestore, "parcels", parcelId), {
        status: "PICKED_UP",
        shelf: "Archived (Released)",
        claimedAt: claimedAtStr,
        claimedBy: updated.claimedBy,
      });
    }

    const residents = await this.getAllResidents();
    const resident = residents.find((r) => r.id === updated.residentId);
    if (resident && resident.activeParcelsCount > 0) {
      await this.updateResidentProfile(resident.id, {
        activeParcelsCount: resident.activeParcelsCount - 1,
      });
    }

    await this.recordActivity({
      type: "PARCEL_RELEASED",
      title: `Parcel Released: ${updated.trackingNumber}`,
      description: `Package released to ${updated.claimedBy} (${updated.unit}).`,
      actor: settings.stationName,
      trackingNumber: updated.trackingNumber,
      badgeColor: "bg-green-600",
    });

    if (resident?.phone) {
      const smsMessage = `${settings.hubName}: Package ${updated.trackingNumber} has been successfully released to ${updated.claimedBy}. Thank you!`;
      await this.recordSms({
        recipientPhone: resident.phone,
        recipientName: resident.name,
        messageText: smsMessage,
        status: "DELIVERED",
        trackingNumber: updated.trackingNumber,
        costEstimate: "₱0.40",
      });
    }

    notifyLocalUpdate();
    return updated;
  }

  async updateParcel(parcelId: string, updates: Partial<Parcel>): Promise<Parcel> {
    if (firestore) {
      await updateDoc(doc(firestore, "parcels", parcelId), sanitizeForFirestore(updates));
    }
    const all = await this.getAllParcels();
    const target = all.find((p) => p.id === parcelId);
    if (!target) throw new Error("Parcel not found");
    notifyLocalUpdate();
    return { ...target, ...updates };
  }

  async deleteParcel(parcelId: string): Promise<boolean> {
    if (firestore) {
      await deleteDoc(doc(firestore, "parcels", parcelId));
      notifyLocalUpdate();
      return true;
    }
    return false;
  }

  // --- Residents ---

  async getAllResidents(): Promise<ResidentProfile[]> {
    if (!firestore) return SEED_RESIDENTS.filter((r) => !this.isDemoUser(r.id, r.name));
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(firestore, "residents"));
      if (snap.empty) return SEED_RESIDENTS.filter((r) => !this.isDemoUser(r.id, r.name));
      return snap.docs
        .map((d) => d.data() as ResidentProfile)
        .filter((r) => !this.isDemoUser(r.id, r.name));
    } catch (err) {
      console.error("Error fetching residents from Firestore:", err);
      return SEED_RESIDENTS.filter((r) => !this.isDemoUser(r.id, r.name));
    }
  }

  async getResidentById(id: string): Promise<ResidentProfile | null> {
    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, "residents", id));
        if (snap.exists()) return snap.data() as ResidentProfile;
      } catch (err) {
        console.error("Error fetching resident by id:", err);
      }
    }
    const all = await this.getAllResidents();
    return all.find((r) => r.id === id) || null;
  }

  async getResidentByEmailOrPhone(emailOrPhone: string): Promise<ResidentProfile | null> {
    const all = await this.getAllResidents();
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanNormPhone = normalizePhone(clean);

    return (
      all.find(
        (r) =>
          r.email.toLowerCase() === clean ||
          (cleanNormPhone.length >= 7 && normalizePhone(r.phone) === cleanNormPhone)
      ) || null
    );
  }

  async createResident(
    profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">
  ): Promise<ResidentProfile> {
    const id = `usr-resident-${Date.now()}`;
    const newResident: ResidentProfile = {
      ...profile,
      id,
      activeParcelsCount: 0,
      totalParcelsReceived: 0,
      createdAt: new Date().toISOString(),
    };

    if (firestore) {
      const sanitized = sanitizeForFirestore(newResident);
      await setDoc(doc(firestore, "residents", id), sanitized);

      // Also mirror to users collection so findUserByCredentials and auth lookup find them instantly
      const userDoc: AuthUser = {
        id: newResident.id,
        email: newResident.email,
        name: newResident.name,
        phone: newResident.phone,
        role: "resident",
        unit: newResident.unit,
        tower: newResident.tower,
        branch: newResident.branch || "Malinta Branch",
        buildingNumber: newResident.buildingNumber,
        floorNumber: newResident.floorNumber,
        unitNumber: newResident.unitNumber,
        plan: newResident.plan,
        planStatus: newResident.planStatus || "ACTIVE",
        paymentMethod: newResident.paymentMethod,
        paymentReference: newResident.paymentReference,
        residentCode: newResident.residentCode,
        authorizedClaimants: newResident.authorizedClaimants || [],
        createdAt: newResident.createdAt,
      };
      await setDoc(doc(firestore, "users", id), sanitizeForFirestore(userDoc));
    }

    await this.recordActivity({
      type: "RESIDENT_REGISTERED",
      title: `Resident Registered: ${newResident.name}`,
      description: `Registered for unit ${newResident.unit} with plan ${newResident.plan}.`,
      actor: "Registration System",
      residentId: newResident.id,
      badgeColor: "bg-purple-600",
    });

    notifyLocalUpdate();
    return newResident;
  }

  async updateResidentProfile(id: string, updates: Partial<ResidentProfile>): Promise<ResidentProfile> {
    if (firestore) {
      const sanitized = sanitizeForFirestore(updates);
      await updateDoc(doc(firestore, "residents", id), sanitized);
      try {
        await updateDoc(doc(firestore, "users", id), sanitized);
      } catch {
        // user doc might not exist in users collection, that is fine
      }
    }
    const target = await this.getResidentById(id);
    if (!target) throw new Error("Resident not found");
    notifyLocalUpdate();
    return { ...target, ...updates };
  }

  // --- Users & Credentials ---

  async findUserByCredentials(emailOrPhone: string): Promise<AuthUser | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanNormPhone = normalizePhone(clean);
    const cleanUser = clean.split("@")[0];

    const matchIdentifier = (email?: string, phone?: string) => {
      const emailLower = (email || "").toLowerCase();
      if (clean && emailLower === clean) return true;
      if (cleanNormPhone.length >= 7 && normalizePhone(phone) === cleanNormPhone) return true;
      if (clean.includes("@") && emailLower.split("@")[0] === cleanUser) return true;
      if (!clean.includes("@") && !clean.startsWith("+") && emailLower.split("@")[0] === clean) return true;
      return false;
    };

    let users: AuthUser[] = SEED_USERS;
    if (firestore) {
      try {
        const snap = await getDocs(collection(firestore, "users"));
        if (!snap.empty) {
          users = snap.docs.map((d) => d.data() as AuthUser);
        }
      } catch (err) {
        console.error("Error finding user:", err);
      }
    }

    const userMatch = users.find((u) => matchIdentifier(u.email, u.phone));
    if (userMatch) return userMatch;

    const residents = await this.getAllResidents();
    const residentMatch = residents.find((r) => matchIdentifier(r.email, r.phone));
    if (residentMatch) {
      return {
        id: residentMatch.id,
        email: residentMatch.email,
        name: residentMatch.name,
        phone: residentMatch.phone,
        role: "resident",
        unit: residentMatch.unit,
        tower: residentMatch.tower,
        branch: residentMatch.branch || "Malinta Branch",
        buildingNumber: residentMatch.buildingNumber,
        floorNumber: residentMatch.floorNumber,
        unitNumber: residentMatch.unitNumber,
        plan: residentMatch.plan,
        planStatus: residentMatch.planStatus,
        paymentMethod: residentMatch.paymentMethod,
        paymentReference: residentMatch.paymentReference,
        residentCode: residentMatch.residentCode,
        authorizedClaimant: residentMatch.authorizedClaimant,
        claimantPhone: residentMatch.claimantPhone,
        authorizedClaimants: residentMatch.authorizedClaimants || [],
        deliveryCreditsLeft: residentMatch.deliveryCreditsLeft,
        subscriptionExpiry: residentMatch.subscriptionExpiry,
        createdAt: residentMatch.createdAt,
      };
    }

    return null;
  }

  // --- Activity Logs ---

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    if (!firestore) return SEED_ACTIVITY_LOGS;
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(firestore, "activity_logs"));
      if (snap.empty) return SEED_ACTIVITY_LOGS;
      return snap.docs.map((d) => d.data() as ActivityLogItem);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      return SEED_ACTIVITY_LOGS;
    }
  }

  async recordActivity(item: Omit<ActivityLogItem, "id" | "timestamp">): Promise<ActivityLogItem> {
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newLog: ActivityLogItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
    };

    if (firestore) {
      await setDoc(doc(firestore, "activity_logs", newLog.id), sanitizeForFirestore(newLog));
    }

    return newLog;
  }

  // --- SMS Logs ---

  async getSmsLogs(): Promise<SmsLogItem[]> {
    if (!firestore) return SEED_SMS_LOGS;
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(firestore, "sms_logs"));
      if (snap.empty) return SEED_SMS_LOGS;
      return snap.docs.map((d) => d.data() as SmsLogItem);
    } catch (err) {
      console.error("Error fetching sms logs:", err);
      return SEED_SMS_LOGS;
    }
  }

  private async recordSms(item: Omit<SmsLogItem, "id" | "timestamp">): Promise<SmsLogItem> {
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newSms: SmsLogItem = {
      ...item,
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
    };

    if (firestore) {
      await setDoc(doc(firestore, "sms_logs", newSms.id), sanitizeForFirestore(newSms));
    }

    return newSms;
  }

  async sendTestSms(recipientPhone: string, recipientName: string, message: string): Promise<SmsLogItem> {
    const item = await this.recordSms({
      recipientPhone,
      recipientName,
      messageText: message,
      status: "DELIVERED",
      trackingNumber: "TEST-DISPATCH",
      costEstimate: "₱0.40",
    });

    await this.recordActivity({
      type: "SMS_DISPATCHED",
      title: `Manual SMS Dispatch to ${recipientName}`,
      description: `Sent test message to ${recipientPhone}.`,
      actor: "Lobby Staff Admin",
      badgeColor: "bg-blue-500",
    });

    return item;
  }

  async getInquiries(): Promise<DeskInquiry[]> {
    if (!firestore) return [];
    await this.ensureSeeded();
    try {
      const snap = await getDocs(collection(firestore, "inquiries"));
      if (snap.empty) return [];
      return snap.docs
        .map((d) => d.data() as DeskInquiry)
        .filter(
          (item) =>
            item.residentName !== "Juan Dela Cruz" &&
            item.residentName !== "Maria Santos" &&
            item.residentId !== "usr-resident-1" &&
            item.residentId !== "usr-resident-2"
        );
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      return [];
    }
  }

  async createInquiry(input: Omit<DeskInquiry, "id" | "createdAt" | "status">): Promise<DeskInquiry> {
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " • " +
      now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const newInquiry: DeskInquiry = {
      ...input,
      id: `inq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: timestampStr,
      status: "NEW",
    };

    if (firestore) {
      await setDoc(doc(firestore, "inquiries", newInquiry.id), sanitizeForFirestore(newInquiry));
    }

    await this.recordActivity({
      type: "INQUIRY_RECEIVED",
      title: `Desk Inquiry from ${newInquiry.residentName} (${newInquiry.residentUnit})`,
      description: `Category: ${newInquiry.category}${newInquiry.trackingNumber ? ` • Ref: ${newInquiry.trackingNumber}` : ""}`,
      actor: newInquiry.residentName,
      badgeColor: "bg-purple-600",
    });

    notifyLocalUpdate();
    return newInquiry;
  }

  async updateInquiry(id: string, updates: Partial<DeskInquiry>): Promise<DeskInquiry> {
    if (firestore) {
      await updateDoc(doc(firestore, "inquiries", id), sanitizeForFirestore(updates));
    }
    const all = await this.getInquiries();
    const target = all.find((i) => i.id === id);
    if (!target) throw new Error("Inquiry not found");
    notifyLocalUpdate();
    return { ...target, ...updates };
  }

  async updateInquiryStatus(id: string, status: InquiryStatus, adminReply?: string): Promise<DeskInquiry> {
    const all = await this.getInquiries();
    const target = all.find((i) => i.id === id);
    if (!target) throw new Error("Inquiry not found");

    const updates: Partial<DeskInquiry> = {
      status,
      ...(adminReply ? { adminReply, repliedAt: new Date().toISOString() } : {}),
    };

    if (firestore) {
      await updateDoc(doc(firestore, "inquiries", id), sanitizeForFirestore(updates));
    }

    await this.recordActivity({
      type: "INQUIRY_RESPONDED",
      title: `Inquiry #${id.slice(-4)} updated: ${status}`,
      description: `Status changed to ${status} for ${target.residentName} (${target.residentUnit}).`,
      actor: "Staff Admin",
      badgeColor: status === "RESOLVED" ? "bg-green-600" : "bg-blue-600",
    });

    notifyLocalUpdate();
    return { ...target, ...updates };
  }

  async deleteInquiry(id: string): Promise<boolean> {
    if (firestore) {
      await deleteDoc(doc(firestore, "inquiries", id));
      notifyLocalUpdate();
      return true;
    }
    return false;
  }

  // --- Hub Settings ---

  async getHubSettings(): Promise<HubSettings> {
    if (firestore) {
      try {
        const snap = await getDoc(doc(firestore, "settings", "default"));
        if (snap.exists()) {
          const loaded = snap.data() as HubSettings;
          return {
            ...DEFAULT_HUB_SETTINGS,
            ...loaded,
            contactPhone: loaded.contactPhone || DEFAULT_HUB_SETTINGS.contactPhone,
            contactEmail: loaded.contactEmail || DEFAULT_HUB_SETTINGS.contactEmail,
            contactAddress: loaded.contactAddress || DEFAULT_HUB_SETTINGS.contactAddress,
            homeFaqs: loaded.homeFaqs && loaded.homeFaqs.length > 0 ? loaded.homeFaqs : DEFAULT_HUB_SETTINGS.homeFaqs,
            residentFaqs: loaded.residentFaqs && loaded.residentFaqs.length > 0 ? loaded.residentFaqs : DEFAULT_HUB_SETTINGS.residentFaqs,
            communityAnnouncements: loaded.communityAnnouncements && loaded.communityAnnouncements.length > 0 ? loaded.communityAnnouncements : DEFAULT_HUB_SETTINGS.communityAnnouncements,
          };
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    }
    return DEFAULT_HUB_SETTINGS;
  }

  async updateHubSettings(updates: Partial<HubSettings>): Promise<HubSettings> {
    const current = await this.getHubSettings();
    const updated = { ...current, ...updates };
    if (firestore) {
      await setDoc(doc(firestore, "settings", "default"), sanitizeForFirestore(updated));
    }

    await this.recordActivity({
      type: "SETTINGS_UPDATED",
      title: "Hub Configuration Updated",
      description: `Holding policy / station parameters modified.`,
      actor: "Staff Admin",
      badgeColor: "bg-gray-600",
    });

    notifyLocalUpdate();
    return updated;
  }
}

/**
 * Real-time listener for residents collection from Firestore.
 * Allows Staff Admin to receive updates live across devices without refreshing.
 */
export function subscribeToResidents(callback: (residents: ResidentProfile[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "residents"),
        (snap) => {
          const list: ResidentProfile[] = [];
          snap.forEach((d) => {
            const data = d.data() as ResidentProfile;
            if (
              data.id !== "usr-resident-1" &&
              data.id !== "usr-resident-2" &&
              data.name !== "Juan Dela Cruz" &&
              data.name !== "Maria Santos"
            ) {
              list.push({ ...data, id: d.id });
            }
          });
          callback(list);
        },
        (err) => {
          console.warn("Firestore residents onSnapshot notice:", err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscribeToResidents failed:", err);
    }
  }
  return () => {};
}

/**
 * Real-time listener for parcels collection from Firestore.
 * Allows residents and staff to receive package arrivals live across devices.
 */
export function subscribeToParcels(callback: (parcels: Parcel[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "parcels"),
        (snap) => {
          const list: Parcel[] = [];
          snap.forEach((d) => {
            const data = d.data() as Parcel;
            if (
              data.residentId !== "usr-resident-1" &&
              data.residentId !== "usr-resident-2" &&
              data.residentName !== "Juan Dela Cruz" &&
              data.residentName !== "Maria Santos"
            ) {
              list.push({ ...data, id: d.id });
            }
          });
          callback(list);
        },
        (err) => {
          console.warn("Firestore parcels onSnapshot notice:", err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscribeToParcels failed:", err);
    }
  }
  return () => {};
}

/**
 * Real-time listener for Hub Settings (announcements, FAQs, store hours, contact info).
 * Pushes any changes saved by Admin on desktop to all open client and resident devices live via WebSocket.
 */
export function subscribeToHubSettings(callback: (settings: HubSettings) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        doc(firestore, "settings", "default"),
        (snap) => {
          if (snap.exists()) {
            const loaded = snap.data() as HubSettings;
            callback({
              ...DEFAULT_HUB_SETTINGS,
              ...loaded,
              contactPhone: loaded.contactPhone || DEFAULT_HUB_SETTINGS.contactPhone,
              contactEmail: loaded.contactEmail || DEFAULT_HUB_SETTINGS.contactEmail,
              contactAddress: loaded.contactAddress || DEFAULT_HUB_SETTINGS.contactAddress,
              homeFaqs: loaded.homeFaqs && loaded.homeFaqs.length > 0 ? loaded.homeFaqs : DEFAULT_HUB_SETTINGS.homeFaqs,
              residentFaqs: loaded.residentFaqs && loaded.residentFaqs.length > 0 ? loaded.residentFaqs : DEFAULT_HUB_SETTINGS.residentFaqs,
              communityAnnouncements: loaded.communityAnnouncements && loaded.communityAnnouncements.length > 0 ? loaded.communityAnnouncements : DEFAULT_HUB_SETTINGS.communityAnnouncements,
            });
          }
        },
        (err) => {
          console.warn("Firestore settings onSnapshot notice:", err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscribeToHubSettings failed:", err);
    }
  }
  return () => {};
}

/**
 * Real-time listener for Desk Inquiries from residents.
 * Allows instant two-way synchronization between resident inquiries and staff responses.
 */
export function subscribeToInquiries(callback: (inquiries: DeskInquiry[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "inquiries"),
        (snap) => {
          const list: DeskInquiry[] = [];
          snap.forEach((d) => {
            const item = d.data() as DeskInquiry;
            if (
              item.residentName !== "Juan Dela Cruz" &&
              item.residentName !== "Maria Santos" &&
              item.residentId !== "usr-resident-1" &&
              item.residentId !== "usr-resident-2"
            ) {
              list.push({ ...item, id: d.id });
            }
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        },
        (err) => {
          console.warn("Firestore inquiries onSnapshot notice:", err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscribeToInquiries failed:", err);
    }
  }
  return () => {};
}

/**
 * Real-time listener for a specific resident's profile document.
 * When staff verifies payment or modifies resident plan on desktop,
 * the resident's mobile phone updates live without needing a refresh or logout!
 */
export function subscribeToUserDoc(
  userId: string,
  callback: (resident: ResidentProfile | null) => void
): () => void {
  if (isFirebaseConfigured() && firestore && userId) {
    try {
      const unsubscribe = onSnapshot(
        doc(firestore, "residents", userId),
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as ResidentProfile);
          } else {
            callback(null);
          }
        },
        (err) => {
          console.warn(`Firestore user ${userId} onSnapshot notice:`, err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn("Firestore subscribeToUserDoc failed:", err);
    }
  }
  return () => {};
}

/**
 * Automatically inspects browser localStorage for any resident or parcel records
 * created prior to cloud synchronization and transparently uploads them to Firestore.
 */
export async function autoMigrateLocalDataToFirestore(): Promise<{ migratedResidents: number; migratedParcels: number }> {
  if (typeof window === "undefined" || !isFirebaseConfigured() || !firestore) {
    return { migratedResidents: 0, migratedParcels: 0 };
  }

  let migratedResidents = 0;
  let migratedParcels = 0;

  try {
    // 1. Scan and migrate local resident accounts
    const residentStorageKeys = ["ck_hub_residents_v2", "ck_hub_residents_v1", "ck_residents"];
    for (const key of residentStorageKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (
              item &&
              item.id &&
              item.id !== "usr-resident-1" &&
              item.id !== "usr-resident-2" &&
              item.name !== "Juan Dela Cruz" &&
              item.name !== "Maria Santos"
            ) {
              const resDocRef = doc(firestore, "residents", item.id);
              const existingSnap = await getDoc(resDocRef);
              if (!existingSnap.exists()) {
                await setDoc(resDocRef, sanitizeForFirestore(item));

                // Also ensure mirrored users collection has the account
                const userDoc: AuthUser = {
                  id: item.id,
                  email: item.email || "",
                  name: item.name || "Resident",
                  phone: item.phone || "",
                  role: "resident",
                  unit: item.unit || "",
                  tower: item.tower || "Tower A",
                  branch: item.branch || "Malinta Branch",
                  buildingNumber: item.buildingNumber,
                  floorNumber: item.floorNumber,
                  unitNumber: item.unitNumber,
                  plan: item.plan || "PER_PARCEL",
                  planStatus: item.planStatus || "ACTIVE",
                  paymentMethod: item.paymentMethod || "CASH_COUNTER",
                  paymentReference: item.paymentReference,
                  residentCode: item.residentCode,
                  authorizedClaimants: item.authorizedClaimants || [],
                  createdAt: item.createdAt || new Date().toISOString(),
                };
                await setDoc(doc(firestore, "users", item.id), sanitizeForFirestore(userDoc));
                migratedResidents++;
                console.log(`[AutoMigrate] Uploaded resident ${item.name} (${item.id}) to Firestore`);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing key ${key}:`, err);
      }
    }

    // 2. Scan and migrate local parcels
    const parcelStorageKeys = ["ck_hub_parcels_v2", "ck_hub_parcels_v1", "ck_parcels"];
    for (const key of parcelStorageKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (
              p &&
              p.id &&
              p.residentId !== "usr-resident-1" &&
              p.residentId !== "usr-resident-2" &&
              p.residentName !== "Juan Dela Cruz" &&
              p.residentName !== "Maria Santos"
            ) {
              const parcelDocRef = doc(firestore, "parcels", p.id);
              const existingSnap = await getDoc(parcelDocRef);
              if (!existingSnap.exists()) {
                await setDoc(parcelDocRef, sanitizeForFirestore(p));
                migratedParcels++;
                console.log(`[AutoMigrate] Uploaded parcel ${p.trackingNumber} (${p.id}) to Firestore`);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing parcel key ${key}:`, err);
      }
    }

    // 3. Scan and migrate active local browser session (critical for mobile phones)
    const sessionKeys = ["ck_hub_session_v2", "ck_hub_session_v1"];
    for (const sKey of sessionKeys) {
      const sRaw = window.localStorage.getItem(sKey);
      if (!sRaw || sRaw === "null") continue;
      try {
        const sessionUser = JSON.parse(sRaw);
        if (
          sessionUser &&
          sessionUser.id &&
          sessionUser.role === "resident" &&
          sessionUser.id !== "usr-resident-1" &&
          sessionUser.id !== "usr-resident-2" &&
          sessionUser.name !== "Juan Dela Cruz" &&
          sessionUser.name !== "Maria Santos"
        ) {
          const resDocRef = doc(firestore, "residents", sessionUser.id);
          const existingSnap = await getDoc(resDocRef);
          if (!existingSnap.exists()) {
            const residentDoc: ResidentProfile = {
              id: sessionUser.id,
              name: sessionUser.name,
              email: sessionUser.email,
              phone: sessionUser.phone,
              unit: sessionUser.unit,
              tower: sessionUser.tower || "Tower A",
              branch: sessionUser.branch || "Malinta Branch",
              buildingNumber: sessionUser.buildingNumber,
              floorNumber: sessionUser.floorNumber,
              unitNumber: sessionUser.unitNumber,
              building: "CK Buildersville Condominium",
              plan: sessionUser.plan || "PER_PARCEL",
              pendingPlan: sessionUser.pendingPlan,
              planStatus: sessionUser.planStatus || "ACTIVE",
              paymentMethod: sessionUser.paymentMethod || "CASH_COUNTER",
              paymentReference: sessionUser.paymentReference,
              deliveryCreditsLeft: sessionUser.deliveryCreditsLeft || 0,
              residentCode: sessionUser.residentCode || `CK-${Math.floor(100000 + Math.random() * 900000)}`,
              authorizedClaimants: sessionUser.authorizedClaimants || [],
              activeParcelsCount: 0,
              totalParcelsReceived: 0,
              status: "ACTIVE",
              notifications: {
                smsArrival: true,
                smsReminder: true,
                emailDigest: true,
                promoUpdates: false,
              },
              createdAt: sessionUser.createdAt || new Date().toISOString(),
            };
            await setDoc(resDocRef, sanitizeForFirestore(residentDoc));
            await setDoc(doc(firestore, "users", sessionUser.id), sanitizeForFirestore(sessionUser));
            migratedResidents++;
            console.log(`[AutoMigrate] Uploaded resident from session ${sessionUser.name} (${sessionUser.id}) to Firestore`);
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing session key ${sKey}:`, err);
      }
    }

    // 3. Purge any legacy demo inquiries from Firestore
    try {
      const inqSnap = await getDocs(collection(firestore, "inquiries"));
      for (const d of inqSnap.docs) {
        const item = d.data() as DeskInquiry;
        if (
          item.residentName === "Juan Dela Cruz" ||
          item.residentName === "Maria Santos" ||
          item.residentId === "usr-resident-1" ||
          item.residentId === "usr-resident-2"
        ) {
          await deleteDoc(d.ref);
          console.log(`[AutoMigrate] Purged legacy demo inquiry ${d.id}`);
        }
      }
    } catch (err) {
      console.warn("[AutoMigrate] Failed checking inquiries to purge:", err);
    }

    if (migratedResidents > 0 || migratedParcels > 0) {
      notifyLocalUpdate();
      console.log(`[AutoMigrate] Successfully migrated ${migratedResidents} resident(s) and ${migratedParcels} parcel(s) to Firestore`);
    }
  } catch (err) {
    console.warn("[AutoMigrate] Exception during localStorage migration:", err);
  }

  return { migratedResidents, migratedParcels };
}
