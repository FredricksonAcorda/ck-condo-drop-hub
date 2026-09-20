import { IDatabaseService } from "./db-interface";
import { Parcel, CreateParcelInput, ResidentProfile, AuthUser } from "@/types";
import { SEED_PARCELS, SEED_RESIDENTS, SEED_USERS } from "./seed-data";

const STORAGE_KEYS = {
  PARCELS: "ck_hub_parcels_v1",
  RESIDENTS: "ck_hub_residents_v1",
  USERS: "ck_hub_users_v1",
};

class LocalDatabaseService implements IDatabaseService {
  private inMemoryParcels: Parcel[] = [...SEED_PARCELS];
  private inMemoryResidents: ResidentProfile[] = [...SEED_RESIDENTS];
  private inMemoryUsers: AuthUser[] = [...SEED_USERS];

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
    return this.load<Parcel[]>(STORAGE_KEYS.PARCELS, this.inMemoryParcels);
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

    // Pick courier color
    const courierColors: Record<string, string> = {
      "SPX Express": "#EE4D2D",
      "J&T Express": "#D21F1F",
      "Flash Express": "#FFB800",
      "LBC Express": "#E31837",
      "Ninja Van": "#C10015",
    };

    const courierColor = courierColors[input.courier] || "#E31837";
    const now = new Date();
    const dateArrivedStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " • " + now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate free holding deadline (7 days for Premium, 3 days for Regular / Per Parcel)
    const freeDays = resident?.plan === "PREMIUM" ? 7 : 3;
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

    // Increment resident active parcel count
    if (resident) {
      await this.updateResidentProfile(resident.id, {
        activeParcelsCount: (resident.activeParcelsCount || 0) + 1,
        totalParcelsReceived: (resident.totalParcelsReceived || 0) + 1,
      });
    }

    return newParcel;
  }

  async verifyClaimCode(claimCode: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const clean = claimCode.trim().toUpperCase();
    return all.find((p) => p.claimCode.toUpperCase() === clean && p.status !== "PICKED_UP") || null;
  }

  async releaseParcel(parcelId: string, claimedBy: string): Promise<Parcel> {
    const all = await this.getAllParcels();
    const index = all.findIndex((p) => p.id === parcelId);
    if (index === -1) throw new Error("Parcel not found");

    const now = new Date();
    const claimedAtStr = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " • " + now.toLocaleTimeString("en-US", {
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

    return updated;
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
    return all.find((r) => r.email.toLowerCase() === clean || r.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")) || null;
  }

  async createResident(profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">): Promise<ResidentProfile> {
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
      (u) => u.email.toLowerCase() === clean || u.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
    );
    if (userMatch) return userMatch;

    // Check resident match
    const residents = await this.getAllResidents();
    const residentMatch = residents.find(
      (r) => r.email.toLowerCase() === clean || r.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
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
        residentCode: residentMatch.residentCode,
        createdAt: residentMatch.createdAt,
      };
    }

    return null;
  }
}

export const db = new LocalDatabaseService();
