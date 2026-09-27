export interface OfficialCourier {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
}

export const OFFICIAL_COURIERS: OfficialCourier[] = [
  {
    id: "spx",
    name: "SPX Express",
    code: "SPX",
    color: "#EE4D2D",
    description: "Shopee Xpress logistics network",
  },
  {
    id: "flash",
    name: "Flash Express",
    code: "FLASH",
    color: "#FFB800",
    description: "Flash Express parcel courier",
  },
  {
    id: "jnt",
    name: "J&T Express",
    code: "JNT",
    color: "#D21F1F",
    description: "J&T Express nationwide delivery",
  },
  {
    id: "yto",
    name: "YTO Express",
    code: "YTO",
    color: "#592780",
    description: "YTO Express logistics service",
  },
  {
    id: "lbc",
    name: "LBC Express",
    code: "LBC",
    color: "#E31837",
    description: "LBC Express delivery courier",
  },
  {
    id: "sto",
    name: "STO Express",
    code: "STO",
    color: "#FF6600",
    description: "STO Express logistics courier",
  },
  {
    id: "other",
    name: "Other Courier",
    code: "OTHER",
    color: "#6B7280",
    description: "Appliances, SM, retail, or unlisted delivery partners",
  },
];

export const OFFICIAL_COURIER_NAMES = OFFICIAL_COURIERS.map((c) => c.name);

export const COURIER_COLOR_MAP: Record<string, string> = OFFICIAL_COURIERS.reduce(
  (acc, c) => {
    acc[c.name] = c.color;
    acc[c.code] = c.color;
    return acc;
  },
  {} as Record<string, string>
);
