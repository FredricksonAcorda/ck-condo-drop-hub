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
    period: "PER MONTH",
    quota: "15 DAYS UNLIMITED PARCELS",
    holdingDays: 15,
    features: [
      "15 Days Free Holding",
      "Unlimited Monthly Parcels",
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
    holdingDays: 30,
    freeDeliveries: 5,
    highlight: "BEST VALUE!",
    features: [
      "30 Days Holding Period",
      "5 Free Door-to-Door Deliveries",
      "Unlimited Monthly Parcels",
      "Priority Lobby Staff Admin Support",
    ],
  },
];
