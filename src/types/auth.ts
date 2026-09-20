export type UserRole = "resident" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  unit?: string;
  tower?: string;
  plan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  residentCode?: string;
  createdAt: string;
}

export interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  tower: string;
  building: string;
  plan: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  residentCode: string;
  authorizedClaimant?: string;
  claimantPhone?: string;
  notifications: {
    smsArrival: boolean;
    smsReminder: boolean;
    emailDigest: boolean;
    promoUpdates: boolean;
  };
  deliveryCreditsLeft?: number;
  totalParcelsReceived: number;
  activeParcelsCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  unit: string;
  tower: string;
  plan: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  password: string;
}
