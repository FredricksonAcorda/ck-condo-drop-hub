import { PillNavItem, NavLinkItem } from "@/types/navigation";

export const PUBLIC_NAV_ITEMS: PillNavItem[] = [
  { label: "Services", href: "/#services" },
  { label: "Pricing & Plans", href: "/#pricing" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
];

export const AUTH_NAV_ITEMS: PillNavItem[] = [
  { label: "LOG IN", href: "/login" },
  { label: "SIGN UP", href: "/register", variant: "primary" },
];

export const FOOTER_QUICK_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Pricing & Plans", href: "/#pricing" },
  { label: "About Us", href: "/#about" },
];
