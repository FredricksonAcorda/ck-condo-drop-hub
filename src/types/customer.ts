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

export interface InvoiceRecord {
  id: string;
  residentId: string;
  residentName: string;
  residentCode: string;
  unit: string;
  tower: string;
  plan: string;
  amount: string;
  date: string;
  timestamp?: string;
  method: string;
  reference?: string;
  status: "PAID" | "PENDING";
}

