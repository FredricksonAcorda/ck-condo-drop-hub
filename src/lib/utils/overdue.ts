import { Parcel } from "@/types";

/**
 * Parses deadline string e.g. "Oct 7, 2026", "October 7, 2026", or ISO strings.
 * Returns the end-of-day timestamp in milliseconds (23:59:59.999 local time),
 * or null if unparseable.
 */
export function parseDeadlineEndOfDay(deadlineStr?: string): number | null {
  if (!deadlineStr) return null;
  const clean = deadlineStr
    .replace(/\(overdue\)/gi, "")
    .replace(/•/g, " ")
    .replace(/deadline:?/gi, "")
    .trim();

  const timestamp = Date.parse(clean);
  if (isNaN(timestamp)) {
    const match = clean.match(/([a-zA-Z]+)\s+(\d{1,2}),?\s*(\d{4})/);
    if (match) {
      const fallbackParsed = Date.parse(`${match[1]} ${match[2]}, ${match[3]}`);
      if (!isNaN(fallbackParsed)) {
        const d = new Date(fallbackParsed);
        d.setHours(23, 59, 59, 999);
        return d.getTime();
      }
    }
    return null;
  }

  const d = new Date(timestamp);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Pure, in-memory function that evaluates whether an active parcel has passed its pickup deadline.
 * Zero database writes, zero network calls, zero side effects.
 */
export function evaluateParcelOverdue(
  parcel: Parcel,
  overdueFeePerDay: number = 20,
  now: Date = new Date()
): Parcel {
  // If parcel is already claimed (PICKED_UP or DELIVERED_DOOR or RETURNED), do not alter status
  if (parcel.status !== "READY" && parcel.status !== "OVERDUE") {
    return parcel;
  }

  const deadlineMs = parseDeadlineEndOfDay(parcel.deadline);
  if (!deadlineMs) {
    return parcel;
  }

  const nowMs = now.getTime();
  if (nowMs <= deadlineMs) {
    // Within free holding period
    if (parcel.status === "OVERDUE") {
      return {
        ...parcel,
        status: "READY",
        holdingFee: "₱0.00 (Free)",
      };
    }
    return parcel;
  }

  // Beyond deadline: calculate days overdue (minimum 1 day)
  const diffMs = nowMs - deadlineMs;
  const daysOverdue = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const rate = typeof overdueFeePerDay === "number" && overdueFeePerDay > 0 ? overdueFeePerDay : 20;
  const feeAmount = daysOverdue * rate;

  return {
    ...parcel,
    status: "OVERDUE",
    holdingFee: `₱${feeAmount}.00 (${daysOverdue} ${daysOverdue === 1 ? "Day" : "Days"})`,
  };
}

/**
 * Batch evaluates a list of parcels synchronously in memory.
 */
export function syncParcelsOverdue(
  parcels: Parcel[],
  overdueFeePerDay: number = 20,
  now: Date = new Date()
): Parcel[] {
  if (!parcels || parcels.length === 0) return [];
  return parcels.map((p) => evaluateParcelOverdue(p, overdueFeePerDay, now));
}
