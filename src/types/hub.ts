export type ActivityType =
  | "PARCEL_INGESTED"
  | "PARCEL_RELEASED"
  | "CLAIM_VERIFIED"
  | "SMS_DISPATCHED"
  | "SETTINGS_UPDATED"
  | "RESIDENT_REGISTERED"
  | "INQUIRY_RECEIVED"
  | "INQUIRY_RESPONDED";

export interface ActivityLogItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  parcelId?: string;
  trackingNumber?: string;
  residentId?: string;
  badgeColor?: string;
}

export interface SmsLogItem {
  id: string;
  recipientPhone: string;
  recipientName: string;
  messageText: string;
  status: "DELIVERED" | "QUEUED" | "FAILED";
  timestamp: string;
  trackingNumber: string;
  costEstimate: string;
}

export type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";

export interface DeskInquiry {
  id: string;
  residentId: string;
  residentName: string;
  residentUnit: string;
  residentPhone: string;
  category: string;
  trackingNumber?: string;
  message: string;
  status: InquiryStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HubSettings {
  hubName: string;
  buildingName: string;
  stationName: string;
  freeDaysRegular: number;
  freeDaysPremium: number;
  overdueFeePerDay: number;
  smsSenderId: string;
  autoPrintIntakeLabel: boolean;
  soundEnabled: boolean;
  maxShelfSlots: number;
}
