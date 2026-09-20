export type ParcelStatus = "READY" | "PICKED_UP" | "OVERDUE";

export interface Parcel {
  id: string;
  trackingNumber: string;
  courier: string;
  courierColor: string;
  dateArrived: string;
  deadline: string;
  holdingFee: string;
  status: ParcelStatus;
  shelf: string;
  claimCode: string;
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
  status: "Claimed";
}
