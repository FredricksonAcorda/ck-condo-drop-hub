export type UserRole = "resident" | "admin";
export type PlanStatus = "ACTIVE" | "PENDING_PAYMENT";
export type PaymentMethod = "GCASH" | "CASH_COUNTER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  unit?: string;
  tower?: string;
  plan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  residentCode?: string;
  deliveryCreditsLeft?: number;
  subscriptionExpiry?: string;
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
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  residentCode: string;
  authorizedClaimant?: string;
  claimantPhone?: string;
  notifications: {
    smsArrival: boolean;
    smsReminder: boolean;
    emailDigest: boolean;
    promoUpdates: boolean;
  };
  preferredDeliveryWindow?: string;
  deliveryInstructions?: string;
  deliveryCreditsLeft?: number;
  subscriptionExpiry?: string;
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
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  password: string;
}
