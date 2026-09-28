import { IDatabaseService } from "./db-interface";
import { Parcel, CreateParcelInput, ResidentProfile, AuthUser, ActivityLogItem, SmsLogItem, HubSettings, DeskInquiry, InquiryStatus } from "@/types";
import {
  SEED_PARCELS,
  SEED_RESIDENTS,
  SEED_USERS,
  SEED_ACTIVITY_LOGS,
  SEED_SMS_LOGS,
  DEFAULT_HUB_SETTINGS,
  SEED_INQUIRIES,
} from "./seed-data";

const STORAGE_KEYS = {
  PARCELS: "ck_hub_parcels_v2",
  RESIDENTS: "ck_hub_residents_v2",
  USERS: "ck_hub_users_v2",
  ACTIVITY: "ck_hub_activity_logs_v2",
  SMS: "ck_hub_sms_logs_v2",
  SETTINGS: "ck_hub_settings_v2",
  INQUIRIES: "ck_hub_desk_inquiries_v2",
};

export class LocalDatabaseService implements IDatabaseService {
  private inMemoryParcels: Parcel[] = [...SEED_PARCELS];
  private inMemoryResidents: ResidentProfile[] = [...SEED_RESIDENTS];
  private inMemoryUsers: AuthUser[] = [...SEED_USERS];
  private inMemoryActivity: ActivityLogItem[] = [...SEED_ACTIVITY_LOGS];
  private inMemorySms: SmsLogItem[] = [...SEED_SMS_LOGS];
  private inMemoryInquiries: DeskInquiry[] = [...SEED_INQUIRIES];
  private inMemorySettings: HubSettings = { ...DEFAULT_HUB_SETTINGS };

  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private isDemoUser(id?: string, name?: string): boolean {
    return (
      id === "usr-resident-1" ||
      id === "usr-resident-2" ||
      name === "Juan Dela Cruz" ||
      name === "Maria Santos"
    );
  }

  private load<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    try {
      const v1Key = key.replace("_v2", "_v1");
      if (v1Key !== key) {
        window.localStorage.removeItem(v1Key);
      }
      const item = window.localStorage.getItem(key);
      if (!item) {
        window.localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    if (!this.isClient()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key } }));
    } catch (err) {
      console.error("Local storage save error:", err);
    }
  }

  // --- Parcels ---

  async getAllParcels(): Promise<Parcel[]> {
    const loaded = this.load<Parcel[]>(STORAGE_KEYS.PARCELS, this.inMemoryParcels);
    const cleaned = loaded.filter(
      (p) => !this.isDemoUser(p.residentId, p.residentName)
    );
    if (cleaned.length !== loaded.length) {
      this.save(STORAGE_KEYS.PARCELS, cleaned);
    }
    return cleaned;
  }

  async getParcelsByResident(residentId: string): Promise<Parcel[]> {
    const all = await this.getAllParcels();
    return all.filter((p) => p.residentId === residentId);
  }

  async getParcelByTracking(trackingNumber: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const cleanSearch = trackingNumber.trim().toUpperCase();
    return all.find((p) => p.trackingNumber.toUpperCase() === cleanSearch) || null;
  }

  async createParcel(input: CreateParcelInput): Promise<Parcel> {
    const all = await this.getAllParcels();
    const residents = await this.getAllResidents();
    const resident = residents.find((r) => r.id === input.residentId);
    const settings = await this.getHubSettings();

    // Pick courier color (official list + other)
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
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    // Calculate free holding deadline based on resident plan & hub settings
    const freeDays = resident?.plan === "PREMIUM" ? settings.freeDaysPremium : settings.freeDaysRegular;
    const deadlineDate = new Date(now.getTime() + freeDays * 24 * 60 * 60 * 1000);
    const deadlineStr = deadlineDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Generate 4-digit unique claim code
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

    all.unshift(newParcel);
    this.save(STORAGE_KEYS.PARCELS, all);

    // Update resident parcel metrics
    if (resident) {
      await this.updateResidentProfile(resident.id, {
        activeParcelsCount: (resident.activeParcelsCount || 0) + 1,
        totalParcelsReceived: (resident.totalParcelsReceived || 0) + 1,
      });
    }

    // Record Activity Log
    await this.recordActivity({
      type: "PARCEL_INGESTED",
      title: `Parcel Ingested: ${newParcel.trackingNumber}`,
      description: `Ingested from ${newParcel.courier} for ${newParcel.residentName} (${newParcel.unit}). Assigned to ${newParcel.shelf}.`,
      actor: settings.stationName,
      trackingNumber: newParcel.trackingNumber,
      residentId: newParcel.residentId,
      badgeColor: "bg-orange-500",
    });

    // Automatically dispatch SMS notification record if resident has phone and enabled SMS alerts
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
    const index = all.findIndex((p) => p.id === parcelId);
    if (index === -1) throw new Error("Parcel not found");

    const settings = await this.getHubSettings();
    const now = new Date();
    const claimedAtStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const updated: Parcel = {
      ...all[index],
      status: "PICKED_UP",
      shelf: "Archived (Released)",
      claimedAt: claimedAtStr,
      claimedBy: claimedBy.trim() || "Resident",
    };

    all[index] = updated;
    this.save(STORAGE_KEYS.PARCELS, all);

    // Decrement resident active parcel count
    const residents = await this.getAllResidents();
    const resident = residents.find((r) => r.id === updated.residentId);
    if (resident && resident.activeParcelsCount > 0) {
      await this.updateResidentProfile(resident.id, {
        activeParcelsCount: resident.activeParcelsCount - 1,
      });
    }

    // Record Activity Log
    await this.recordActivity({
      type: "PARCEL_RELEASED",
      title: `Parcel Released: ${updated.trackingNumber}`,
      description: `Package released to ${updated.claimedBy} (${updated.unit}).`,
      actor: settings.stationName,
      trackingNumber: updated.trackingNumber,
      badgeColor: "bg-green-600",
    });

    // Record SMS pickup confirmation
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

    return updated;
  }

  async updateParcel(parcelId: string, updates: Partial<Parcel>): Promise<Parcel> {
    const all = await this.getAllParcels();
    const index = all.findIndex((p) => p.id === parcelId);
    if (index === -1) throw new Error("Parcel not found");

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    this.save(STORAGE_KEYS.PARCELS, all);
    return updated;
  }

  async deleteParcel(parcelId: string): Promise<boolean> {
    const all = await this.getAllParcels();
    const filtered = all.filter((p) => p.id !== parcelId);
    if (filtered.length === all.length) return false;
    this.save(STORAGE_KEYS.PARCELS, filtered);
    return true;
  }

  // --- Residents ---

  async getAllResidents(): Promise<ResidentProfile[]> {
    const loaded = this.load<ResidentProfile[]>(STORAGE_KEYS.RESIDENTS, this.inMemoryResidents);
    const cleaned = loaded.filter((r) => !this.isDemoUser(r.id, r.name));
    if (cleaned.length !== loaded.length) {
      this.save(STORAGE_KEYS.RESIDENTS, cleaned);
    }
    return cleaned;
  }

  async getResidentById(id: string): Promise<ResidentProfile | null> {
    const all = await this.getAllResidents();
    return all.find((r) => r.id === id) || null;
  }

  async getResidentByEmailOrPhone(emailOrPhone: string): Promise<ResidentProfile | null> {
    const all = await this.getAllResidents();
    const clean = emailOrPhone.trim().toLowerCase();
    return (
      all.find(
        (r) =>
          r.email.toLowerCase() === clean ||
          r.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
      ) || null
    );
  }

  async createResident(
    profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">
  ): Promise<ResidentProfile> {
    const all = await this.getAllResidents();
    const id = `usr-resident-${Date.now()}`;
    const newResident: ResidentProfile = {
      ...profile,
      id,
      activeParcelsCount: 0,
      totalParcelsReceived: 0,
      createdAt: new Date().toISOString(),
    };
    all.push(newResident);
    this.save(STORAGE_KEYS.RESIDENTS, all);

    await this.recordActivity({
      type: "RESIDENT_REGISTERED",
      title: `Resident Registered: ${newResident.name}`,
      description: `Registered for unit ${newResident.unit} with plan ${newResident.plan}.`,
      actor: "Registration System",
      residentId: newResident.id,
      badgeColor: "bg-purple-600",
    });

    return newResident;
  }

  async updateResidentProfile(id: string, updates: Partial<ResidentProfile>): Promise<ResidentProfile> {
    const all = await this.getAllResidents();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Resident not found");

    const updated = { ...all[index], ...updates };
    all[index] = updated;
    this.save(STORAGE_KEYS.RESIDENTS, all);
    return updated;
  }

  // --- Users ---

  async findUserByCredentials(emailOrPhone: string): Promise<AuthUser | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, "").replace(/^63/, "0");
    const cleanUser = clean.split("@")[0];

    const matchIdentifier = (email: string, phone: string) => {
      const emailLower = email.toLowerCase();
      const phoneDigits = phone.replace(/\D/g, "").replace(/^63/, "0");
      if (emailLower === clean) return true;
      if (cleanDigits && phoneDigits === cleanDigits) return true;
      if (clean.includes("@") && emailLower.split("@")[0] === cleanUser) return true;
      if (!clean.includes("@") && !clean.startsWith("+") && emailLower.split("@")[0] === clean) return true;
      return false;
    };

    const users = this.load<AuthUser[]>(STORAGE_KEYS.USERS, this.inMemoryUsers).filter(
      (u) => !this.isDemoUser(u.id, u.name)
    );

    // Check staff match
    const userMatch = users.find((u) => matchIdentifier(u.email, u.phone));
    if (userMatch) return userMatch;

    // Check resident match
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
    const loaded = this.load<ActivityLogItem[]>(STORAGE_KEYS.ACTIVITY, this.inMemoryActivity);
    const cleaned = loaded.filter(
      (a) =>
        !a.description?.includes("Juan Dela Cruz") &&
        !a.description?.includes("Maria Santos") &&
        !a.title?.includes("Juan Dela Cruz") &&
        !a.title?.includes("Maria Santos")
    );
    if (cleaned.length !== loaded.length) {
      this.save(STORAGE_KEYS.ACTIVITY, cleaned);
    }
    return cleaned;
  }

  async recordActivity(item: Omit<ActivityLogItem, "id" | "timestamp">): Promise<ActivityLogItem> {
    const logs = await this.getActivityLogs();
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const newLog: ActivityLogItem = {
      ...item,
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
    };

    logs.unshift(newLog);
    this.save(STORAGE_KEYS.ACTIVITY, logs);
    return newLog;
  }

  // --- SMS Logs ---

  async getSmsLogs(): Promise<SmsLogItem[]> {
    const loaded = this.load<SmsLogItem[]>(STORAGE_KEYS.SMS, this.inMemorySms);
    const cleaned = loaded.filter(
      (s) =>
        s.recipientName !== "Juan Dela Cruz" &&
        s.recipientName !== "Maria Santos"
    );
    if (cleaned.length !== loaded.length) {
      this.save(STORAGE_KEYS.SMS, cleaned);
    }
    return cleaned;
  }

  private async recordSms(item: Omit<SmsLogItem, "id" | "timestamp">): Promise<SmsLogItem> {
    const logs = await this.getSmsLogs();
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const newSms: SmsLogItem = {
      ...item,
      id: `sms-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
    };

    logs.unshift(newSms);
    this.save(STORAGE_KEYS.SMS, logs);
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

  // --- Desk Inquiries ---

  async getInquiries(): Promise<DeskInquiry[]> {
    const loaded = this.load<DeskInquiry[]>(STORAGE_KEYS.INQUIRIES, this.inMemoryInquiries);
    const cleaned = loaded.filter(
      (i) => !this.isDemoUser(i.residentId, i.residentName)
    );
    if (cleaned.length !== loaded.length) {
      this.save(STORAGE_KEYS.INQUIRIES, cleaned);
    }
    return cleaned;
  }

  async createInquiry(input: Omit<DeskInquiry, "id" | "createdAt" | "status">): Promise<DeskInquiry> {
    const inquiries = await this.getInquiries();
    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    // If creating a new door delivery request, supersede any older pending requests for this resident
    if (input.category.toLowerCase().includes("door") || input.category.toLowerCase().includes("delivery")) {
      inquiries.forEach((item) => {
        if (
          item.residentId === input.residentId &&
          (item.category.toLowerCase().includes("door") || item.category.toLowerCase().includes("delivery")) &&
          (item.status === "NEW" || item.status === "IN_PROGRESS")
        ) {
          item.status = "RESOLVED";
          item.updatedAt = timestampStr;
        }
      });
    }

    const newInquiry: DeskInquiry = {
      ...input,
      id: `inq-${Date.now()}`,
      status: "NEW",
      createdAt: timestampStr,
    };

    inquiries.unshift(newInquiry);
    this.save(STORAGE_KEYS.INQUIRIES, inquiries);

    await this.recordActivity({
      type: "INQUIRY_RECEIVED",
      title: `Desk Inquiry from ${input.residentName} (${input.residentUnit})`,
      description: `Category: ${input.category}${input.trackingNumber ? ` • Ref: ${input.trackingNumber}` : ""}`,
      actor: input.residentName,
      badgeColor: "bg-purple-600",
    });

    return newInquiry;
  }

  async updateInquiry(id: string, updates: Partial<DeskInquiry>): Promise<DeskInquiry> {
    const inquiries = await this.getInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Inquiry with ID ${id} not found.`);
    }

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const current = inquiries[index];
    const updated: DeskInquiry = {
      ...current,
      ...updates,
      updatedAt: timestampStr,
    };

    inquiries[index] = updated;
    this.save(STORAGE_KEYS.INQUIRIES, inquiries);

    await this.recordActivity({
      type: "INQUIRY_RESPONDED",
      title: `Inquiry #${id.slice(-4)} updated by ${current.residentName}`,
      description: `Delivery request parameters / message updated.`,
      actor: current.residentName,
      badgeColor: "bg-blue-600",
    });

    return updated;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus, adminReply?: string): Promise<DeskInquiry> {
    const inquiries = await this.getInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Inquiry with ID ${id} not found.`);
    }

    const now = new Date();
    const timestampStr =
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " • " +
      now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const current = inquiries[index];
    const isDoorDelivery =
      current.category.toLowerCase().includes("door") || current.category.toLowerCase().includes("delivery");

    const updated: DeskInquiry = {
      ...current,
      status,
      adminReply: adminReply !== undefined ? adminReply : current.adminReply,
      updatedAt: timestampStr,
    };

    inquiries[index] = updated;

    // If resolving a door delivery request, also mark any duplicate pending door requests for the same resident as RESOLVED
    if (status === "RESOLVED" && isDoorDelivery) {
      inquiries.forEach((item, idx) => {
        if (
          idx !== index &&
          item.residentId === current.residentId &&
          (item.category.toLowerCase().includes("door") || item.category.toLowerCase().includes("delivery")) &&
          (item.status === "NEW" || item.status === "IN_PROGRESS")
        ) {
          item.status = "RESOLVED";
          item.updatedAt = timestampStr;
          if (!item.adminReply && adminReply) {
            item.adminReply = adminReply;
          }
        }
      });
    }

    this.save(STORAGE_KEYS.INQUIRIES, inquiries);

    await this.recordActivity({
      type: "INQUIRY_RESPONDED",
      title: `Inquiry #${id.slice(-4)} marked ${status}`,
      description: `Resident: ${current.residentName} (${current.residentUnit})${adminReply ? ` • Reply: "${adminReply.slice(0, 40)}..."` : ""}`,
      actor: "Lobby Staff Admin",
      badgeColor: status === "RESOLVED" ? "bg-emerald-600" : "bg-amber-600",
    });

    return updated;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const inquiries = await this.getInquiries();
    const filtered = inquiries.filter((i) => i.id !== id);
    if (filtered.length === inquiries.length) return false;

    this.save(STORAGE_KEYS.INQUIRIES, filtered);
    await this.recordActivity({
      type: "INQUIRY_RESPONDED",
      title: `Inquiry #${id.slice(-4)} cancelled`,
      description: `Pending request removed by resident.`,
      actor: "Resident Portal",
      badgeColor: "bg-gray-500",
    });

    return true;
  }

  // --- Hub Settings ---

  async getHubSettings(): Promise<HubSettings> {
    const loaded = this.load<HubSettings>(STORAGE_KEYS.SETTINGS, this.inMemorySettings);
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

  async updateHubSettings(updates: Partial<HubSettings>): Promise<HubSettings> {
    const current = await this.getHubSettings();
    const updated = { ...current, ...updates };
    this.save(STORAGE_KEYS.SETTINGS, updated);

    await this.recordActivity({
      type: "SETTINGS_UPDATED",
      title: "Hub Configuration Updated",
      description: `Holding policy / station parameters modified.`,
      actor: "Staff Admin",
      badgeColor: "bg-gray-600",
    });

    return updated;
  }
}

import { isFirebaseConfigured } from "../firebase/config";
import { FirestoreDatabaseService } from "./firestore-store";

export const db: IDatabaseService = isFirebaseConfigured()
  ? new FirestoreDatabaseService()
  : new LocalDatabaseService();

