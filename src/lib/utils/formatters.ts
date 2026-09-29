import { MembershipPlan, ParcelStatus, PlanStatus } from "@/types";

/**
 * Formats a numeric value into Philippine Peso string (e.g. ₱149.00 or ₱0.00).
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "₱0.00";
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats an ISO string or Date into standard Philippine short date (e.g. Sep 30, 2026).
 */
export function formatShortDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats an ISO string or Date into short date with 12-hour time (e.g. Sep 30, 2026 • 08:30 PM).
 */
export function formatDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "—";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);
    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Returns consistent styling tokens and human-readable label for Membership Plans.
 */
export function getPlanBadgeConfig(plan: MembershipPlan): {
  label: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
} {
  switch (plan) {
    case "PREMIUM":
      return {
        label: "VIP Premium",
        badgeClass: "bg-red-50 text-brand-red border-red-200",
        borderClass: "border-red-200",
        bgClass: "bg-red-50",
        textClass: "text-brand-red",
      };
    case "REGULAR":
      return {
        label: "Regular Pass",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        borderClass: "border-blue-200",
        bgClass: "bg-blue-50",
        textClass: "text-blue-700",
      };
    case "PER_PARCEL":
    default:
      return {
        label: "Pay Per Parcel",
        badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
        borderClass: "border-zinc-200",
        bgClass: "bg-zinc-100",
        textClass: "text-zinc-700",
      };
  }
}

/**
 * Returns consistent styling tokens and human-readable label for Plan Statuses.
 */
export function getPlanStatusBadgeConfig(status?: PlanStatus | string): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "PENDING_VERIFICATION":
      return {
        label: "Pending Verification",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "PENDING_PAYMENT":
      return {
        label: "Pending Payment",
        badgeClass: "bg-orange-50 text-orange-700 border border-orange-200",
      };
    default:
      return {
        label: status || "Unknown",
        badgeClass: "bg-gray-100 text-gray-700 border border-gray-200",
      };
  }
}

/**
 * Returns consistent styling tokens and human-readable label for Parcel Statuses.
 */
export function getParcelStatusBadgeConfig(status: ParcelStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case "READY":
      return {
        label: "Ready for Pickup",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "PICKED_UP":
      return {
        label: "Picked Up",
        badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
      };
    case "OVERDUE":
      return {
        label: "Overdue",
        badgeClass: "bg-red-50 text-red-700 border-red-200",
      };
    default:
      return {
        label: status,
        badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
      };
  }
}
