import { InvoiceRecord } from "@/types";
import { db } from "./local-store";
import { firestore, isFirebaseConfigured } from "../firebase/config";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { sanitizeForFirestore } from "./firestore-store";

const INVOICES_KEY = "ck_hub_invoices_v2";

export const INITIAL_SEED_INVOICES: InvoiceRecord[] = [];

/**
 * Filter out legacy demo account invoices.
 */
function filterDemoInvoices(invoices: InvoiceRecord[]): InvoiceRecord[] {
  return invoices.filter(
    (inv: InvoiceRecord) =>
      inv.residentId !== "usr-resident-1" &&
      inv.residentId !== "usr-resident-2" &&
      inv.residentName !== "Juan Dela Cruz" &&
      inv.residentName !== "Maria Santos"
  );
}

/**
 * Retrieve all invoices.
 * If Firebase is configured, fetches from Firestore and updates local cache.
 * Falls back to window.localStorage if offline or Firebase is disabled.
 */
export async function getAllInvoices(): Promise<InvoiceRecord[]> {
  if (isFirebaseConfigured() && firestore) {
    try {
      const snap = await getDocs(collection(firestore, "invoices"));
      const list: InvoiceRecord[] = [];
      snap.forEach((d) => {
        const data = d.data() as InvoiceRecord;
        list.push({ ...data, id: d.id });
      });

      const cleaned = filterDemoInvoices(list);
      cleaned.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      if (typeof window !== "undefined") {
        localStorage.setItem(INVOICES_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (err) {
      console.warn("Firestore getAllInvoices error, falling back to localStorage:", err);
    }
  }

  if (typeof window === "undefined") return [...INITIAL_SEED_INVOICES];
  try {
    window.localStorage.removeItem("ck_hub_invoices_v1");

    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_SEED_INVOICES));
      return [...INITIAL_SEED_INVOICES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_SEED_INVOICES));
      return [...INITIAL_SEED_INVOICES];
    }
    const cleaned = filterDemoInvoices(parsed);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [...INITIAL_SEED_INVOICES];
  }
}

/**
 * Real-time listener for invoices collection from Firestore.
 * Allows Staff Admin to receive updates live across devices without refreshing.
 */
export function subscribeToInvoices(callback: (invoices: InvoiceRecord[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "invoices"),
        (snap) => {
          const list: InvoiceRecord[] = [];
          snap.forEach((d) => {
            const data = d.data() as InvoiceRecord;
            list.push({ ...data, id: d.id });
          });
          const cleaned = filterDemoInvoices(list);
          cleaned.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
          });
          if (typeof window !== "undefined") {
            localStorage.setItem(INVOICES_KEY, JSON.stringify(cleaned));
          }
          callback(cleaned);
        },
        (err) => {
          console.warn("Firestore invoices subscription error:", err);
        }
      );
      return unsubscribe;
    } catch (e) {
      console.warn("Failed to subscribe to invoices in Firestore:", e);
    }
  }
  return () => {};
}

export async function getInvoicesByResident(residentId: string): Promise<InvoiceRecord[]> {
  const all = await getAllInvoices();
  return all.filter((inv) => inv.residentId === residentId);
}

export async function recordInvoice(
  inv: Omit<InvoiceRecord, "id"> & { id?: string }
): Promise<InvoiceRecord> {
  const id = inv.id || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const record: InvoiceRecord = {
    ...inv,
    id,
    timestamp: inv.timestamp || new Date().toISOString(),
  };

  // Write to Firestore if configured
  if (isFirebaseConfigured() && firestore) {
    try {
      await setDoc(doc(firestore, "invoices", id), sanitizeForFirestore(record));
    } catch (err) {
      console.error("Failed to write invoice to Firestore:", err);
    }
  }

  // Update localStorage cache
  if (typeof window !== "undefined") {
    try {
      const all = await getAllInvoices();
      const updated = [record, ...all.filter((existing) => existing.id !== id)];
      localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));

      // Also sync to per-resident key for backwards compatibility
      const residentKey = `ck_invoices_${inv.residentId}`;
      const residentList = updated.filter((i) => i.residentId === inv.residentId);
      localStorage.setItem(residentKey, JSON.stringify(residentList));

      window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key: INVOICES_KEY } }));
    } catch (e) {
      console.warn("Local storage cache update failed:", e);
    }
  }
  return record;
}

export async function verifyAndActivateMembership(
  invoiceId: string,
  verifiedBy: string = "Lobby Admin"
): Promise<InvoiceRecord | null> {
  const all = await getAllInvoices();
  const target = all.find((i) => i.id === invoiceId);
  if (!target) return null;

  const now = new Date();
  target.status = "PAID";
  target.verifiedAt = now.toISOString();
  target.verifiedBy = verifiedBy;
  target.date = "Today";

  const isPremium =
    target.pendingPlan === "PREMIUM" ||
    target.plan.toUpperCase().includes("PREMIUM");

  const isRegular =
    target.pendingPlan === "REGULAR" ||
    target.plan.toUpperCase().includes("REGULAR");

  const targetPlan = isPremium ? "PREMIUM" : isRegular ? "REGULAR" : "PER_PARCEL";
  const planDays = isPremium ? 30 : 15;
  const newExpiry = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000).toISOString();

  // Update in Firestore
  if (isFirebaseConfigured() && firestore) {
    try {
      await updateDoc(doc(firestore, "invoices", invoiceId), sanitizeForFirestore({
        status: "PAID",
        verifiedAt: target.verifiedAt,
        verifiedBy: target.verifiedBy,
        date: "Today",
      }));
    } catch (err) {
      console.error("Failed to update invoice in Firestore:", err);
    }
  }

  // Update local storage
  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(all));

    // Sync to per-resident key
    const residentKey = `ck_invoices_${target.residentId}`;
    const residentList = all.filter((i) => i.residentId === target.residentId);
    localStorage.setItem(residentKey, JSON.stringify(residentList));
  }

  // Update resident profile in DB (handles Firestore automatically)
  try {
    const residents = await db.getAllResidents();
    const resident = residents.find((r) => r.id === target.residentId);

    await db.updateResidentProfile(target.residentId, {
      plan: targetPlan,
      planStatus: "ACTIVE",
      pendingPlan: undefined,
      pendingSubmittedAt: undefined,
      paymentReference: target.reference || resident?.paymentReference,
      paymentMethod: target.method.includes("GCash") ? "GCASH" : "CASH_COUNTER",
      deliveryCreditsLeft: isPremium ? 1 : 0,
      subscriptionExpiry: newExpiry,
    });

    // Also update currently active auth session if it matches this resident
    if (typeof window !== "undefined") {
      const sessionRaw = localStorage.getItem("ck_hub_session_v1");
      if (sessionRaw && sessionRaw !== "null") {
        try {
          const session = JSON.parse(sessionRaw);
          if (session && session.id === target.residentId) {
            session.plan = targetPlan;
            session.planStatus = "ACTIVE";
            session.pendingPlan = undefined;
            session.pendingSubmittedAt = undefined;
            session.deliveryCreditsLeft = isPremium ? 1 : 0;
            session.subscriptionExpiry = newExpiry;
            localStorage.setItem("ck_hub_session_v1", JSON.stringify(session));
          }
        } catch {
          // ignore session parse failure
        }
      }
    }

    await db.recordActivity({
      type: "RESIDENT_REGISTERED",
      title: `Payment Verified: ${target.residentName}`,
      description: `Verified payment of ${target.amount} (${target.method}). Activated ${targetPlan} Plan.`,
      actor: verifiedBy,
      residentId: target.residentId,
      badgeColor: "bg-emerald-600",
    });
  } catch (e) {
    console.error("Failed to activate resident profile:", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key: INVOICES_KEY } }));
  }

  return target;
}

export async function rejectMembershipPayment(
  invoiceId: string,
  reason: string = "Payment receipt could not be verified"
): Promise<InvoiceRecord | null> {
  const all = await getAllInvoices();
  const target = all.find((i) => i.id === invoiceId);
  if (!target) return null;

  target.status = "REJECTED";
  target.notes = reason;

  // Update in Firestore
  if (isFirebaseConfigured() && firestore) {
    try {
      await updateDoc(doc(firestore, "invoices", invoiceId), sanitizeForFirestore({
        status: "REJECTED",
        notes: reason,
      }));
    } catch (err) {
      console.error("Failed to update rejected invoice in Firestore:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(all));

    const residentKey = `ck_invoices_${target.residentId}`;
    const residentList = all.filter((i) => i.residentId === target.residentId);
    localStorage.setItem(residentKey, JSON.stringify(residentList));
  }

  try {
    await db.updateResidentProfile(target.residentId, {
      planStatus: "ACTIVE",
      pendingPlan: undefined,
      pendingSubmittedAt: undefined,
    });

    if (typeof window !== "undefined") {
      const sessionRaw = localStorage.getItem("ck_hub_session_v1");
      if (sessionRaw && sessionRaw !== "null") {
        try {
          const session = JSON.parse(sessionRaw);
          if (session && session.id === target.residentId) {
            session.planStatus = "ACTIVE";
            session.pendingPlan = undefined;
            session.pendingSubmittedAt = undefined;
            localStorage.setItem("ck_hub_session_v1", JSON.stringify(session));
          }
        } catch {
          // ignore
        }
      }
    }

    await db.recordActivity({
      type: "RESIDENT_REGISTERED",
      title: `Payment Rejected: ${target.residentName}`,
      description: `Membership payment rejected. Reason: ${reason}`,
      actor: "Lobby Admin",
      residentId: target.residentId,
      badgeColor: "bg-red-600",
    });
  } catch (e) {
    console.error("Failed to reset resident status:", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key: INVOICES_KEY } }));
  }

  return target;
}

export async function confirmCashPayment(invoiceId: string): Promise<InvoiceRecord | null> {
  return verifyAndActivateMembership(invoiceId, "Lobby Staff (Cash Counter)");
}
