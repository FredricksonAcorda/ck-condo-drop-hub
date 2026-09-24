import { IDatabaseService } from "./db-interface";
import { Parcel, CreateParcelInput, ResidentProfile, AuthUser, ActivityLogItem, SmsLogItem, HubSettings } from "@/types";
import {
  SEED_PARCELS,
  SEED_RESIDENTS,
  SEED_USERS,
  SEED_ACTIVITY_LOGS,
  SEED_SMS_LOGS,
  DEFAULT_HUB_SETTINGS,
} from "./seed-data";

const STORAGE_KEYS = {
  PARCELS: "ck_hub_parcels_v1",
  RESIDENTS: "ck_hub_residents_v1",
  USERS: "ck_hub_users_v1",
  ACTIVITY: "ck_hub_activity_logs_v1",
  SMS: "ck_hub_sms_logs_v1",
  SETTINGS: "ck_hub_settings_v1",
};

class LocalDatabaseService implements IDatabaseService {
  private inMemoryParcels: Parcel[] = [...SEED_PARCELS];
  private inMemoryResidents: ResidentProfile[] = [...SEED_RESIDENTS];
  private inMemoryUsers: AuthUser[] = [...SEED_USERS];
  private inMemoryActivity: ActivityLogItem[] = [...SEED_ACTIVITY_LOGS];
  private inMemorySms: SmsLogItem[] = [...SEED_SMS_LOGS];
  private inMemorySettings: HubSettings = { ...DEFAULT_HUB_SETTINGS };

  private isClient(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private load<T>(key: string, fallback: T): T {
    if (!this.isClient()) return fallback;
    try {
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
    const existingIds = new Set(loaded.map((p) => p.id));
    const missingSeeds = SEED_PARCELS.filter((p) => !existingIds.has(p.id));
    if (missingSeeds.length > 0) {
      const merged = [...loaded, ...missingSeeds];
      this.save(STORAGE_KEYS.PARCELS, merged);
      return merged;
    }
    return loaded;
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

    // Pick courier color
    const courierColors: Record<string, string> = {
      "SPX Express": "#EE4D2D",
      "J&T Express": "#D21F1F",
      "Flash Express": "#FFB800",
      "LBC Express": "#E31837",
      "Ninja Van": "#C10015",
      "DHL Express": "#D40511",
    };

    const courierColor = courierColors[input.courier] || "#E31837";
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

    // Automatically dispatch SMS notification record if resident has phone
    if (resident?.phone) {
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
        actor: "Front Desk Officer",
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
    return this.load<ResidentProfile[]>(STORAGE_KEYS.RESIDENTS, this.inMemoryResidents);
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
    const users = this.load<AuthUser[]>(STORAGE_KEYS.USERS, this.inMemoryUsers);

    // Check staff match
    const userMatch = users.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
    );
    if (userMatch) return userMatch;

    // Check resident match
    const residents = await this.getAllResidents();
    const residentMatch = residents.find(
      (r) =>
        r.email.toLowerCase() === clean ||
        r.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
    );
    if (residentMatch) {
      return {
        id: residentMatch.id,
        email: residentMatch.email,
        name: residentMatch.name,
        phone: residentMatch.phone,
        role: "resident",
        unit: residentMatch.unit,
        tower: residentMatch.tower,
        plan: residentMatch.plan,
        planStatus: residentMatch.planStatus,
        paymentMethod: residentMatch.paymentMethod,
        paymentReference: residentMatch.paymentReference,
        residentCode: residentMatch.residentCode,
        createdAt: residentMatch.createdAt,
      };
    }

    return null;
  }

  // --- Activity Logs ---

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    return this.load<ActivityLogItem[]>(STORAGE_KEYS.ACTIVITY, this.inMemoryActivity);
  }

  private async recordActivity(item: Omit<ActivityLogItem, "id" | "timestamp">): Promise<ActivityLogItem> {
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
    return this.load<SmsLogItem[]>(STORAGE_KEYS.SMS, this.inMemorySms);
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
      actor: "Station 1 Staff",
      badgeColor: "bg-blue-500",
    });

    return item;
  }

  // --- Hub Settings ---

  async getHubSettings(): Promise<HubSettings> {
    return this.load<HubSettings>(STORAGE_KEYS.SETTINGS, this.inMemorySettings);
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

export const db = new LocalDatabaseService();
