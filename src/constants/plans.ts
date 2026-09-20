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
    price: "₱99",
    period: "PER MONTH",
    quota: "UP TO 15 PARCELS / MO",
    holdingDays: 3,
    features: ["3 Days Free Holding", "Priority Front Desk Desk", "Online Tracking"],
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
      "7 Days Holding Period",
      "5 Free Door-to-Door Deliveries",
      "Unlimited Monthly Parcels",
      "Priority Concierge Support",
    ],
  },
];
