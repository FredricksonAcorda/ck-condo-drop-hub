import { Parcel, CreateParcelInput, ResidentProfile, AuthUser } from "@/types";

export interface IDatabaseService {
  // Parcels
  getAllParcels(): Promise<Parcel[]>;
  getParcelsByResident(residentId: string): Promise<Parcel[]>;
  getParcelByTracking(trackingNumber: string): Promise<Parcel | null>;
  createParcel(input: CreateParcelInput): Promise<Parcel>;
  verifyClaimCode(claimCode: string): Promise<Parcel | null>;
  releaseParcel(parcelId: string, claimedBy: string): Promise<Parcel>;

  // Residents & Profiles
  getAllResidents(): Promise<ResidentProfile[]>;
  getResidentById(id: string): Promise<ResidentProfile | null>;
  getResidentByEmailOrPhone(emailOrPhone: string): Promise<ResidentProfile | null>;
  createResident(profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">): Promise<ResidentProfile>;
  updateResidentProfile(id: string, updates: Partial<ResidentProfile>): Promise<ResidentProfile>;

  // Auth Users
  findUserByCredentials(emailOrPhone: string): Promise<AuthUser | null>;
}
