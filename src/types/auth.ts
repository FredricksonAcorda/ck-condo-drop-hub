export type UserRole = "resident" | "admin";
export type MembershipPlan = "PER_PARCEL" | "REGULAR" | "PREMIUM";
export type PlanStatus = "ACTIVE" | "PENDING_PAYMENT" | "PENDING_VERIFICATION";
export type PaymentMethod = "GCASH" | "CASH_COUNTER";

export interface AuthorizedClaimant {
  name: string;
  phone: string;
  relationship?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  unit?: string;
  tower?: string;
  branch?: string;
  buildingNumber?: string;
  floorNumber?: string;
  unitNumber?: string;
  plan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  pendingPlan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  residentCode?: string;
  authorizedClaimant?: string;
  claimantPhone?: string;
  authorizedClaimants?: AuthorizedClaimant[];
  deliveryCreditsLeft?: number;
  subscriptionExpiry?: string;
  pendingSubmittedAt?: string;
  createdAt: string;
}

export interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  tower: string;
  branch?: string;
  buildingNumber?: string;
  floorNumber?: string;
  unitNumber?: string;
  building: string;
  plan: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  pendingPlan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  residentCode: string;
  authorizedClaimant?: string;
  claimantPhone?: string;
  authorizedClaimants?: AuthorizedClaimant[];
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
  pendingSubmittedAt?: string;
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
  tower?: string;
  branch?: string;
  buildingNumber?: string;
  floorNumber?: string;
  unitNumber?: string;
  plan: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  pendingPlan?: "PER_PARCEL" | "REGULAR" | "PREMIUM";
  planStatus?: PlanStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  password: string;
}
