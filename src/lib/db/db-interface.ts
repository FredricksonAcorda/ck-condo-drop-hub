import { Parcel, CreateParcelInput, ResidentProfile, AuthUser, ActivityLogItem, SmsLogItem, HubSettings, DeskInquiry, InquiryStatus } from "@/types";

export interface IDatabaseService {
  // Parcels
  getAllParcels(): Promise<Parcel[]>;
  getParcelsByResident(residentId: string): Promise<Parcel[]>;
  getParcelByTracking(trackingNumber: string): Promise<Parcel | null>;
  createParcel(input: CreateParcelInput): Promise<Parcel>;
  verifyClaimCode(claimCode: string): Promise<Parcel | null>;
  releaseParcel(parcelId: string, claimedBy: string): Promise<Parcel>;
  updateParcel(parcelId: string, updates: Partial<Parcel>): Promise<Parcel>;
  deleteParcel(parcelId: string): Promise<boolean>;

  // Residents & Profiles
  getAllResidents(): Promise<ResidentProfile[]>;
  getResidentById(id: string): Promise<ResidentProfile | null>;
  getResidentByEmailOrPhone(emailOrPhone: string): Promise<ResidentProfile | null>;
  createResident(profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">): Promise<ResidentProfile>;
  updateResidentProfile(id: string, updates: Partial<ResidentProfile>): Promise<ResidentProfile>;

  // Auth Users
  findUserByCredentials(emailOrPhone: string): Promise<AuthUser | null>;

  // Activity & SMS Logs
  getActivityLogs(): Promise<ActivityLogItem[]>;
  getSmsLogs(): Promise<SmsLogItem[]>;
  sendTestSms(recipientPhone: string, recipientName: string, message: string): Promise<SmsLogItem>;

  // Desk Inquiries
  getInquiries(): Promise<DeskInquiry[]>;
  createInquiry(inquiry: Omit<DeskInquiry, "id" | "createdAt" | "status">): Promise<DeskInquiry>;
  updateInquiryStatus(id: string, status: InquiryStatus, adminReply?: string): Promise<DeskInquiry>;

  // Hub Settings
  getHubSettings(): Promise<HubSettings>;
  updateHubSettings(settings: Partial<HubSettings>): Promise<HubSettings>;
}
