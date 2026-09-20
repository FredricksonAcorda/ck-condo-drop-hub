export type MembershipTier = "FREE" | "REGULAR" | "PREMIUM";

export interface ResidentProfile {
  id: string;
  name: string;
  unit: string;
  tower: string;
  mobile: string;
  email: string;
  membershipTier: MembershipTier;
  residentCode: string;
  authorizedClaimants?: string[];
}

export interface CustomerDirectoryItem {
  id: string;
  name: string;
  unit: string;
  tower: string;
  phone: string;
  activeParcels: number;
  status: "Active" | "Pending" | "Inactive";
}
