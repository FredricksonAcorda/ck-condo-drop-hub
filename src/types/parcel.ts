export type ParcelStatus = "READY" | "PICKED_UP" | "OVERDUE";

export interface Parcel {
  id: string;
  trackingNumber: string;
  courier: string;
  courierColor: string;
  residentId: string;
  residentName: string;
  unit: string;
  tower?: string;
  shelf: string;
  size?: "Small" | "Medium" | "Large" | "Bulky" | "Oversize";
  dateArrived: string;
  deadline: string;
  holdingFee: string;
  status: ParcelStatus;
  claimCode: string;
  claimedAt?: string;
  claimedBy?: string;
  notes?: string;
}

export interface RecentParcel {
  id: string;
  tracking: string;
  recipient: string;
  unit: string;
  courier: string;
  time: string;
  status: ParcelStatus;
  shelf: string;
}

export interface ParcelHistoryItem {
  trackingNumber: string;
  courier: string;
  dateClaimed: string;
  claimedBy: string;
  status: string;
  fee?: string;
}

export interface CreateParcelInput {
  trackingNumber: string;
  courier: string;
  residentId: string;
  residentName: string;
  unit: string;
  shelf: string;
  size?: "Small" | "Medium" | "Large" | "Bulky" | "Oversize";
  notes?: string;
}
