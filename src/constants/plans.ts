export interface PlanDefinition {
  id: string;
  name: string;
  price: string;
  period: string;
  quota: string;
  holdingDays: number;
  freeDeliveries?: number;
  highlight?: string;
  features: string[];
}

export const MEMBERSHIP_PLANS: PlanDefinition[] = [
  {
    id: "per-parcel",
    name: "Per Parcel",
    price: "₱15",
    period: "PER CLAIM",
    quota: "PAY AS YOU PICK UP",
    holdingDays: 3,
    features: ["3 Days Free Holding", "Secure Storage", "SMS Arrival Notice"],
  },
  {
    id: "regular",
    name: "Regular Plan",
    price: "₱149",
    period: "15 DAYS",
    quota: "15 DAYS UNLIMITED PARCELS",
    holdingDays: 3,
    features: [
      "3 Days Free Holding",
      "15 Days Unlimited Parcels",
      "Priority Lobby Pickup",
      "Online Tracking",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₱299",
    period: "PER MONTH",
    quota: "30 DAYS UNLIMITED PARCELS",
    holdingDays: 7,
    freeDeliveries: 5,
    highlight: "BEST VALUE!",
    features: [
      "7 Days Free Holding",
      "30 Days Unlimited Parcels",
      "5 Free Door-to-Door Deliveries",
      "Priority Lobby Staff Admin Support",
    ],
  },
];
