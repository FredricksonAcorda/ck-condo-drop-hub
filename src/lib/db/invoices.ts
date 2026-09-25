import { InvoiceRecord } from "@/types";
import { db } from "./local-store";

const INVOICES_KEY = "ck_hub_invoices_v1";

export const INITIAL_SEED_INVOICES: InvoiceRecord[] = [
  {
    id: "INV-2026-0901",
    residentId: "usr-resident-1",
    residentName: "Juan Dela Cruz",
    residentCode: "CK-000123",
    unit: "Unit 101",
    tower: "Tower A",
    plan: "PREMIUM VIP Membership",
    amount: "₱299.00",
    date: "Sept 1, 2026",
    timestamp: "2026-09-01T08:30:00Z",
    method: "GCash QR",
    reference: "GC-9821-4402",
    status: "PAID",
  },
  {
    id: "INV-2026-0801",
    residentId: "usr-resident-1",
    residentName: "Juan Dela Cruz",
    residentCode: "CK-000123",
    unit: "Unit 101",
    tower: "Tower A",
    plan: "Regular Membership",
    amount: "₱149.00",
    date: "Aug 1, 2026",
    timestamp: "2026-08-01T10:15:00Z",
    method: "GCash QR",
    reference: "GC-1029-3381",
    status: "PAID",
  },
  {
    id: "INV-2026-0815",
    residentId: "usr-resident-2",
    residentName: "Maria Santos",
    residentCode: "CK-000189",
    unit: "Unit 304",
    tower: "Tower B",
    plan: "Regular Membership",
    amount: "₱149.00",
    date: "Aug 15, 2026",
    timestamp: "2026-08-15T09:30:00Z",
    method: "GCash QR",
    reference: "GC-5512-8890",
    status: "PAID",
  },
  {
    id: "INV-2026-0915",
    residentId: "usr-resident-3",
    residentName: "Roberto Reyes",
    residentCode: "CK-000245",
    unit: "Unit 205",
    tower: "Tower A",
    plan: "Regular Membership (15 Days)",
    amount: "₱149.00",
    date: "Today",
    timestamp: "2026-09-25T10:00:00Z",
    method: "Cash at Counter",
    status: "PENDING",
  },
];

export async function getAllInvoices(): Promise<InvoiceRecord[]> {
  if (typeof window === "undefined") return [...INITIAL_SEED_INVOICES];
  try {
    const raw = localStorage.getItem(INVOICES_KEY);
    if (!raw) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_SEED_INVOICES));
      return [...INITIAL_SEED_INVOICES];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_SEED_INVOICES));
      return [...INITIAL_SEED_INVOICES];
    }
    return parsed;
  } catch {
    return [...INITIAL_SEED_INVOICES];
  }
}

export async function getInvoicesByResident(residentId: string): Promise<InvoiceRecord[]> {
  const all = await getAllInvoices();
  return all.filter((inv) => inv.residentId === residentId);
}

export async function recordInvoice(
  inv: Omit<InvoiceRecord, "id"> & { id?: string }
): Promise<InvoiceRecord> {
  const all = await getAllInvoices();
  const id = inv.id || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const record: InvoiceRecord = {
    ...inv,
    id,
    timestamp: inv.timestamp || new Date().toISOString(),
  };

  const updated = [record, ...all.filter((existing) => existing.id !== id)];
  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(updated));

    // Also sync to per-resident key for backwards compatibility
    const residentKey = `ck_invoices_${inv.residentId}`;
    const residentList = updated.filter((i) => i.residentId === inv.residentId);
    localStorage.setItem(residentKey, JSON.stringify(residentList));

    window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key: INVOICES_KEY } }));
  }
  return record;
}

export async function confirmCashPayment(invoiceId: string): Promise<InvoiceRecord | null> {
  const all = await getAllInvoices();
  const target = all.find((i) => i.id === invoiceId);
  if (!target) return null;

  target.status = "PAID";
  target.method = "Cash at Counter";
  target.date = "Today";

  if (typeof window !== "undefined") {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(all));

    // Sync to per-resident key
    const residentKey = `ck_invoices_${target.residentId}`;
    const residentList = all.filter((i) => i.residentId === target.residentId);
    localStorage.setItem(residentKey, JSON.stringify(residentList));

    // Update resident profile to ACTIVE
    try {
      await db.updateResidentProfile(target.residentId, {
        planStatus: "ACTIVE",
      });
    } catch (e) {
      console.error("Failed to activate resident profile:", e);
    }

    window.dispatchEvent(new CustomEvent("ck_db_updated", { detail: { key: INVOICES_KEY } }));
  }

  return target;
}
