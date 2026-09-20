export type MembershipTier = "FREE" | "REGULAR" | "PREMIUM";

export { type ResidentProfile } from "./auth";

export interface CustomerDirectoryItem {
  id: string;
  name: string;
  unit: string;
  tower: string;
  phone: string;
  activeParcels: number;
  status: "Active" | "Pending" | "Inactive";
}
