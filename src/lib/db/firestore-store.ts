import { IDatabaseService } from "./db-interface";
import {
  Parcel, CreateParcelInput, ResidentProfile, AuthUser, ActivityLogItem, SmsLogItem, HubSettings, DeskInquiry, InquiryStatus,
} from "@/types";
import { firestore, isFirebaseConfigured } from "../firebase/config";
import {
  collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot,
} from "firebase/firestore";
import {
  SEED_PARCELS,
  SEED_RESIDENTS,
  SEED_USERS,
  SEED_ACTIVITY_LOGS,
  SEED_SMS_LOGS,
  DEFAULT_HUB_SETTINGS,
  SEED_INQUIRIES,
} from "./seed-data";
import { localStoreFallback, STORAGE_KEYS } from "./local-store";

/**
 * Normalizes any Philippine or international phone number to its core digits (last 10 digits for PH mobile).
 * Ensures matching works seamlessly whether stored as "+63 9XX", "09XX", or "9XX".
 */
export function normalizePhone(rawPhone?: string): string {
  if (!rawPhone) return "";
  const digits = rawPhone.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

let quotaExhaustedUntil: number = 0;

export function isFirestoreQuotaExhausted(): boolean {
  if (typeof window === "undefined") return false;
  if (Date.now() < quotaExhaustedUntil) return true;
  try {
    const stored = window.localStorage.getItem("ck_hub_quota_exhausted_until");
    if (stored) {
      const until = parseInt(stored, 10);
      if (Date.now() < until) {
        quotaExhaustedUntil = until;
        return true;
      }
    }
  } catch { }
  return false;
}

export function markFirestoreQuotaExhausted(durationMs: number = 5 * 60 * 1000): void {
  quotaExhaustedUntil = Date.now() + durationMs;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem("ck_hub_quota_exhausted_until", quotaExhaustedUntil.toString());
    } catch { }
  }
  console.warn(`[Firestore] Quota limit active. Falling back to local offline cache for ${durationMs / 1000}s.`);
}

/**
 * Helper to race any Firestore promise with an aggressive timeout to prevent UI freezes.
 */
export async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Firestore timeout")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Universal error handler that catches Firebase quota / network limits and triggers circuit breaker.
 */
export function handleFirestoreError(err: unknown, contextMsg: string): void {
  const errorObj = err as { code?: string; message?: string };
  const msg = String(errorObj?.message || err || "").toLowerCase();
  const code = String(errorObj?.code || "").toLowerCase();
  console.warn(`[Firestore] ${contextMsg}:`, msg || err);
  if (msg.includes("quota") || msg.includes("resource-exhausted") || code.includes("resource-exhausted")) {
    markFirestoreQuotaExhausted();
  }
}

/**
 * Recursively strips any keys whose value is undefined.
 * Firestore strictly rejects undefined field values at the SDK level.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return data;
}

function notifyLocalUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ck_db_updated"));
  }
}

export function getParcelTimestamp(p: Parcel): number {
  if (p.createdAt) {
    const t = new Date(p.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const match = p.id?.match(/^pcl-(\d+)/);
  if (match) {
    const t = Number(match[1]);
    if (!isNaN(t) && t > 0) return t;
  }
  if (p.dateArrived) {
    const clean = p.dateArrived.replace("•", "").trim();
    const t = new Date(clean).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

/**
 * Safely parses a parcel's holding deadline string into an end-of-day Date (23:59:59.999).
 * Supports standard format "Oct 15, 2026", "October 15, 2026", or with trailing tags.
 */
export function parseDeadlineEndOfDay(deadlineStr?: string): Date | null {
  if (!deadlineStr) return null;
  const clean = deadlineStr.replace(/\s*\(overdue\)/i, "").trim();

  // 1. Regex to extract "Month Day, Year" even if prefixed (e.g. "Holding Deadline: Oct 15, 2026")
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, okt: 9, nov: 10, dec: 11,
  };
  const textMatch = clean.match(/([a-zA-Z]{3,})\s+(\d{1,2}),?\s+(\d{4})/);
  if (textMatch) {
    const monthKey = textMatch[1].toLowerCase().slice(0, 3);
    const monthIndex = months[monthKey];
    const day = parseInt(textMatch[2], 10);
    const year = parseInt(textMatch[3], 10);
    if (monthIndex !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, monthIndex, day, 23, 59, 59, 999);
    }
  }

  // 2. Direct standard Date parse with end-of-day
  const d = new Date(`${clean} 23:59:59`);
  if (!isNaN(d.getTime())) return d;

  // 3. Fallback to generic Date
  const fallback = new Date(clean);
  if (!isNaN(fallback.getTime())) {
    fallback.setHours(23, 59, 59, 999);
    return fallback;
  }
  return null;
}

/**
 * Evaluates whether an unclaimed parcel has exceeded its free holding deadline.
 * If current date/time is past deadline:
 *   - Updates status to "OVERDUE"
 *   - Computes exact days overdue and accrued storage holding fee.
 * If parcel is already claimed / picked up, its status is never altered.
 */
export function evaluateParcelOverdue(
  parcel: Parcel,
  feePerDay: number = 20,
  now: Date = new Date()
): { parcel: Parcel; changed: boolean } {
  // Never alter status of completed/archived parcels
  if (
    parcel.status === "PICKED_UP" ||
    parcel.status === "DELIVERED_DOOR" ||
    parcel.status === "RETURNED"
  ) {
    return { parcel, changed: false };
  }

  const deadlineEnd = parseDeadlineEndOfDay(parcel.deadline);
  if (!deadlineEnd) {
    return { parcel, changed: false };
  }

  const diffMs = now.getTime() - deadlineEnd.getTime();
  if (diffMs > 0) {
    // Current time is past holding deadline -> OVERDUE
    const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    const totalFee = overdueDays * (feePerDay || 20);
    const feeStr = `₱${totalFee.toFixed(2)} (${overdueDays} ${overdueDays === 1 ? "Day" : "Days"})`;

    const needsStatusUpdate = parcel.status !== "OVERDUE";
    const needsFeeUpdate = parcel.holdingFee !== feeStr;

    if (needsStatusUpdate || needsFeeUpdate) {
      return {
        parcel: {
          ...parcel,
          status: "OVERDUE",
          holdingFee: feeStr,
        },
        changed: true,
      };
    }
    return { parcel, changed: false };
  } else {
    // Still within free holding period
    if (parcel.status === "OVERDUE") {
      return {
        parcel: {
          ...parcel,
          status: "READY",
          holdingFee: "₱0.00 (Free)",
        },
        changed: true,
      };
    }
    return { parcel, changed: false };
  }
}

/**
 * Runs all parcels through the overdue evaluator purely in memory.
 * Computes exact overdue status and accrued holding fees dynamically without making any database writes.
 */
export function syncParcelsOverdue(
  parcels: Parcel[],
  feePerDay: number = 20
): Parcel[] {
  return parcels.map((p) => evaluateParcelOverdue(p, feePerDay).parcel);
}

export class FirestoreDatabaseService implements IDatabaseService {
  private seeded = false;

  private isDemoUser(id?: string, name?: string): boolean {
    return (
      id === "usr-resident-1" ||
      id === "usr-resident-2" ||
      name === "Juan Dela Cruz" ||
      name === "Maria Santos"
    );
  }

  private async ensureSeeded(): Promise<void> {
    if (!firestore || this.seeded || isFirestoreQuotaExhausted()) return;
    this.seeded = true;
    try {
      // Check if parcels collection exists
      const parcelsSnap = await withFirestoreTimeout(getDocs(query(collection(firestore, "parcels"), limit(1))), 2000);
      if (parcelsSnap.empty) {
        for (const p of SEED_PARCELS) {
          if (!this.isDemoUser(p.residentId, p.residentName)) {
            await setDoc(doc(firestore, "parcels", p.id), p);
          }
        }
      }

      // Check residents collection
      const residentsSnap = await withFirestoreTimeout(getDocs(query(collection(firestore, "residents"), limit(1))), 2000);
      if (residentsSnap.empty) {
        for (const r of SEED_RESIDENTS) {
          if (!this.isDemoUser(r.id, r.name)) {
            await setDoc(doc(firestore, "residents", r.id), r);
          }
        }
      }

      // Check users collection
      const usersSnap = await withFirestoreTimeout(getDocs(query(collection(firestore, "users"), limit(1))), 2000);
      if (usersSnap.empty) {
        for (const u of SEED_USERS) {
          if (!this.isDemoUser(u.id, u.name)) {
            await setDoc(doc(firestore, "users", u.id), u);
          }
        }
      }

      // Check settings doc
      const settingsDoc = await withFirestoreTimeout(getDoc(doc(firestore, "settings", "default")), 2000);
      if (!settingsDoc.exists()) {
        await setDoc(doc(firestore, "settings", "default"), DEFAULT_HUB_SETTINGS);
      }
    } catch (err) {
      handleFirestoreError(err, "ensureSeeded");
    }
  }

  // --- Parcels ---

  async getAllParcels(): Promise<Parcel[]> {
    if (!firestore || isFirestoreQuotaExhausted()) {
      return syncParcelsOverdue(await localStoreFallback.getAllParcels());
    }
    await this.ensureSeeded();
    try {
      const snap = await withFirestoreTimeout(getDocs(collection(firestore, "parcels")), 2500);
      let list: Parcel[] = [];
      if (!snap.empty) {
        list = snap.docs
          .map((d) => d.data() as Parcel)
          .filter((p) => !this.isDemoUser(p.residentId, p.residentName));
      }

      // Bidirectional reconciliation: Push any locally created parcels that haven't reached Firestore yet
      const currentFirestore = firestore;
      if (currentFirestore) {
        try {
          const localList = await localStoreFallback.getAllParcels();
          const cloudIds = new Set(list.map((p) => p.id));
          const unpushed = localList.filter((lp) => !cloudIds.has(lp.id) && !this.isDemoUser(lp.residentId, lp.residentName));
          if (unpushed.length > 0) {
            unpushed.forEach((lp) => {
              setDoc(doc(currentFirestore, "parcels", lp.id), sanitizeForFirestore(lp)).catch(() => { });
            });
            list.push(...unpushed);
          }
        } catch { }
      }

      if (list.length === 0) {
        return syncParcelsOverdue(await localStoreFallback.getAllParcels());
      }

      const sorted = list.sort((a, b) => getParcelTimestamp(b) - getParcelTimestamp(a));
      localStoreFallback.saveSilent(STORAGE_KEYS.PARCELS, sorted);
      return syncParcelsOverdue(sorted);
    } catch (err) {
      handleFirestoreError(err, "getAllParcels");
      return syncParcelsOverdue(await localStoreFallback.getAllParcels());
    }
  }

  async getParcelsByResident(residentId: string): Promise<Parcel[]> {
    return (await this.getAllParcels()).filter((p) => p.residentId === residentId);
  }

  async getParcelByTracking(trackingNumber: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const cleanSearch = trackingNumber.trim().toUpperCase();
    return all.find((p) => p.trackingNumber.toUpperCase() === cleanSearch) || null;
  }

  async createParcel(input: CreateParcelInput): Promise<Parcel> {
    // 1. Instantly create and persist in local storage (zero UI lag, works offline & quota-proof)
    const newParcel = await localStoreFallback.createParcel(input);

    // 2. Non-blocking asynchronous cloud write to Firestore with timeout
    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            setDoc(doc(firestore, "parcels", newParcel.id), sanitizeForFirestore(newParcel)),
            3000
          );
          const resident = (await this.getAllResidents()).find((r) => r.id === input.residentId);
          if (resident) {
            await withFirestoreTimeout(
              updateDoc(doc(firestore, "residents", resident.id), {
                activeParcelsCount: (resident.activeParcelsCount || 0) + 1,
                totalParcelsReceived: (resident.totalParcelsReceived || 0) + 1,
              }),
              3000
            ).catch(() => { });
          }
          const settings = await this.getHubSettings();
          await withFirestoreTimeout(
            setDoc(doc(firestore, "activity_logs", `act-${Date.now()}`), sanitizeForFirestore({
              id: `act-${Date.now()}`,
              type: "PARCEL_INGESTED",
              title: `Parcel Ingested: ${newParcel.trackingNumber}`,
              description: `Ingested from ${newParcel.courier} for ${newParcel.residentName} (${newParcel.unit}). Assigned to ${newParcel.shelf}.`,
              timestamp: new Date().toISOString(),
              actor: settings.stationName,
              trackingNumber: newParcel.trackingNumber,
              residentId: newParcel.residentId,
              badgeColor: "bg-orange-500",
            })),
            3000
          ).catch(() => { });
        } catch (err) {
          handleFirestoreError(err, "createParcel cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return newParcel;
  }

  async verifyClaimCode(claimCode: string): Promise<Parcel | null> {
    const all = await this.getAllParcels();
    const clean = claimCode.trim().toUpperCase();
    const match = all.find((p) => p.claimCode.toUpperCase() === clean && p.status !== "PICKED_UP") || null;

    if (match) {
      await this.recordActivity({
        type: "CLAIM_VERIFIED",
        title: `Claim Verified: ${match.claimCode}`,
        description: `Passcode verified for ${match.residentName} (${match.unit}) for package ${match.trackingNumber}.`,
        actor: "Lobby Staff Admin",
        trackingNumber: match.trackingNumber,
        badgeColor: "bg-blue-600",
      });
    }

    return match;
  }

  async releaseParcel(parcelId: string, claimedBy: string): Promise<Parcel> {
    const updated = await localStoreFallback.releaseParcel(parcelId, claimedBy);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            updateDoc(doc(firestore, "parcels", parcelId), {
              status: "PICKED_UP",
              shelf: "Archived (Released)",
              claimedAt: updated.claimedAt,
              claimedBy: updated.claimedBy,
            }),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "releaseParcel cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }

  async updateParcel(parcelId: string, updates: Partial<Parcel>): Promise<Parcel> {
    const updated = await localStoreFallback.updateParcel(parcelId, updates);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            updateDoc(doc(firestore, "parcels", parcelId), sanitizeForFirestore(updates)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "updateParcel cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }

  async deleteParcel(parcelId: string): Promise<boolean> {
    const res = await localStoreFallback.deleteParcel(parcelId);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            deleteDoc(doc(firestore, "parcels", parcelId)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "deleteParcel cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return res;
  }

  // --- Residents ---

  async getAllResidents(): Promise<ResidentProfile[]> {
    if (!firestore || isFirestoreQuotaExhausted()) return localStoreFallback.getAllResidents();
    await this.ensureSeeded();
    try {
      const snap = await withFirestoreTimeout(getDocs(collection(firestore, "residents")), 2500);
      let list: ResidentProfile[] = [];
      if (!snap.empty) {
        list = snap.docs
          .map((d) => d.data() as ResidentProfile)
          .filter((r) => !this.isDemoUser(r.id, r.name));
      }

      // Bidirectional reconciliation: Push any locally registered residents that haven't reached Firestore yet
      const currentFirestore = firestore;
      if (currentFirestore) {
        try {
          const localList = await localStoreFallback.getAllResidents();
          const cloudIds = new Set(list.map((r) => r.id));
          const unpushed = localList.filter((lr) => !cloudIds.has(lr.id) && !this.isDemoUser(lr.id, lr.name));
          if (unpushed.length > 0) {
            unpushed.forEach((lr) => {
              setDoc(doc(currentFirestore, "residents", lr.id), sanitizeForFirestore(lr)).catch(() => { });
            });
            list.push(...unpushed);
          }
        } catch { }
      }

      if (list.length === 0) {
        return localStoreFallback.getAllResidents();
      }

      localStoreFallback.saveSilent(STORAGE_KEYS.RESIDENTS, list);
      return list;
    } catch (err) {
      handleFirestoreError(err, "getAllResidents");
      return localStoreFallback.getAllResidents();
    }
  }

  async getResidentById(id: string): Promise<ResidentProfile | null> {
    if (firestore && !isFirestoreQuotaExhausted()) {
      try {
        const snap = await withFirestoreTimeout(getDoc(doc(firestore, "residents", id)), 2000);
        if (snap.exists()) return snap.data() as ResidentProfile;
      } catch (err) {
        handleFirestoreError(err, "getResidentById");
      }
    }
    const all = await this.getAllResidents();
    return all.find((r) => r.id === id) || null;
  }

  async getResidentByEmailOrPhone(emailOrPhone: string): Promise<ResidentProfile | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanNormPhone = normalizePhone(clean);

    // 1. Instant check in local browser storage (0 cloud reads)
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = window.localStorage.getItem("ck_hub_residents_v2");
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const match = list.find(
              (r) =>
                r.email?.toLowerCase() === clean ||
                (cleanNormPhone.length >= 7 && normalizePhone(r.phone) === cleanNormPhone)
            );
            if (match) return match;
          }
        }
      } catch (e) {
        // continue
      }
    }

    // 2. Targeted Firestore query (1 document read maximum)
    if (firestore && !isFirestoreQuotaExhausted()) {
      try {
        const q = clean.includes("@")
          ? query(collection(firestore, "residents"), where("email", "==", clean), limit(1))
          : cleanNormPhone.length >= 7
            ? query(collection(firestore, "residents"), where("phone", "==", cleanNormPhone), limit(1))
            : null;
        if (q) {
          const snap = await withFirestoreTimeout(getDocs(q), 2000);
          if (!snap.empty) {
            return snap.docs[0].data() as ResidentProfile;
          }
        }
      } catch (err: unknown) {
        handleFirestoreError(err, "getResidentByEmailOrPhone");
      }
    }

    return null;
  }

  async createResident(
    profile: Omit<ResidentProfile, "id" | "createdAt" | "activeParcelsCount" | "totalParcelsReceived">
  ): Promise<ResidentProfile> {
    const newResident = await localStoreFallback.createResident(profile);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          const sanitized = sanitizeForFirestore(newResident);
          await withFirestoreTimeout(setDoc(doc(firestore, "residents", newResident.id), sanitized), 3000);

          const userDoc: AuthUser = {
            id: newResident.id,
            email: newResident.email,
            name: newResident.name,
            phone: newResident.phone,
            role: "resident",
            unit: newResident.unit,
            tower: newResident.tower,
            branch: newResident.branch || "Malinta Branch",
            buildingNumber: newResident.buildingNumber,
            floorNumber: newResident.floorNumber,
            unitNumber: newResident.unitNumber,
            plan: newResident.plan,
            planStatus: newResident.planStatus || "ACTIVE",
            paymentMethod: newResident.paymentMethod,
            paymentReference: newResident.paymentReference,
            residentCode: newResident.residentCode,
            authorizedClaimants: newResident.authorizedClaimants || [],
            createdAt: newResident.createdAt,
          };
          await withFirestoreTimeout(setDoc(doc(firestore, "users", newResident.id), sanitizeForFirestore(userDoc)), 3000);
        } catch (err) {
          handleFirestoreError(err, "createResident cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return newResident;
  }

  async updateResidentProfile(id: string, updates: Partial<ResidentProfile>): Promise<ResidentProfile> {
    const updated = await localStoreFallback.updateResidentProfile(id, updates);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          const sanitized = sanitizeForFirestore(updates);
          await withFirestoreTimeout(updateDoc(doc(firestore, "residents", id), sanitized), 3000);
          try {
            await withFirestoreTimeout(updateDoc(doc(firestore, "users", id), sanitized), 3000);
          } catch { }
        } catch (err) {
          handleFirestoreError(err, "updateResidentProfile cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }

  // --- Users & Credentials ---

  async findUserByCredentials(emailOrPhone: string): Promise<AuthUser | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanNormPhone = normalizePhone(clean);
    const cleanUser = clean.split("@")[0];

    const matchIdentifier = (email?: string, phone?: string) => {
      const emailLower = (email || "").toLowerCase();
      if (clean && emailLower === clean) return true;
      if (cleanNormPhone.length >= 7 && normalizePhone(phone) === cleanNormPhone) return true;
      if (clean.includes("@") && emailLower.split("@")[0] === cleanUser) return true;
      if (!clean.includes("@") && !clean.startsWith("+") && emailLower.split("@")[0] === clean) return true;
      return false;
    };

    // 1. Instant check in local browser storage (0 cloud reads)
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const rawResidents = window.localStorage.getItem("ck_hub_residents_v2");
        if (rawResidents) {
          const list = JSON.parse(rawResidents);
          if (Array.isArray(list)) {
            const match = list.find((r) => matchIdentifier(r.email, r.phone));
            if (match) {
              return {
                id: match.id,
                email: match.email,
                name: match.name,
                phone: match.phone,
                role: "resident",
                unit: match.unit,
                tower: match.tower,
                branch: match.branch || "Malinta Branch",
                buildingNumber: match.buildingNumber,
                floorNumber: match.floorNumber,
                unitNumber: match.unitNumber,
                plan: match.plan,
                planStatus: match.planStatus,
                paymentMethod: match.paymentMethod,
                paymentReference: match.paymentReference,
                residentCode: match.residentCode,
                authorizedClaimants: match.authorizedClaimants || [],
                deliveryCreditsLeft: match.deliveryCreditsLeft,
                subscriptionExpiry: match.subscriptionExpiry,
                createdAt: match.createdAt,
              };
            }
          }
        }
      } catch (e) {
        console.warn("Local storage lookup notice:", e);
      }
    }

    // 2. Targeted query in Firestore (reads at most 1-2 docs, NOT 250 docs!)
    if (firestore && !isFirestoreQuotaExhausted()) {
      try {
        // Query users collection for exact match
        const qUsers = clean.includes("@")
          ? query(collection(firestore, "users"), where("email", "==", clean), limit(1))
          : cleanNormPhone.length >= 7
            ? query(collection(firestore, "users"), where("phone", "==", cleanNormPhone), limit(1))
            : null;

        if (qUsers) {
          const uSnap = await getDocs(qUsers);
          if (!uSnap.empty) {
            return uSnap.docs[0].data() as AuthUser;
          }
        }

        // Query residents collection for exact match
        const qResidents = clean.includes("@")
          ? query(collection(firestore, "residents"), where("email", "==", clean), limit(1))
          : cleanNormPhone.length >= 7
            ? query(collection(firestore, "residents"), where("phone", "==", cleanNormPhone), limit(1))
            : null;

        if (qResidents) {
          const rSnap = await getDocs(qResidents);
          if (!rSnap.empty) {
            const r = rSnap.docs[0].data() as ResidentProfile;
            return {
              id: r.id,
              email: r.email,
              name: r.name,
              phone: r.phone,
              role: "resident",
              unit: r.unit,
              tower: r.tower,
              branch: r.branch || "Malinta Branch",
              buildingNumber: r.buildingNumber,
              floorNumber: r.floorNumber,
              unitNumber: r.unitNumber,
              plan: r.plan,
              planStatus: r.planStatus,
              paymentMethod: r.paymentMethod,
              paymentReference: r.paymentReference,
              residentCode: r.residentCode,
              authorizedClaimants: r.authorizedClaimants || [],
              deliveryCreditsLeft: r.deliveryCreditsLeft,
              subscriptionExpiry: r.subscriptionExpiry,
              createdAt: r.createdAt,
            };
          }
        }
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error?.code === "resource-exhausted" || error?.message?.includes("Quota exceeded")) {
          markFirestoreQuotaExhausted();
        }
        console.warn("Targeted Firestore user query notice:", err);
      }
    }

    // 3. Fallback to SEED_USERS for demo accounts
    const userMatch = SEED_USERS.find((u) => matchIdentifier(u.email, u.phone));
    if (userMatch) return userMatch;

    return null;
  }

  // --- Activity Logs ---

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    if (!firestore || isFirestoreQuotaExhausted()) return localStoreFallback.getActivityLogs();
    await this.ensureSeeded();
    try {
      const snap = await withFirestoreTimeout(
        getDocs(query(collection(firestore, "activity_logs"), orderBy("timestamp", "desc"), limit(50))),
        2500
      );
      if (snap.empty) return localStoreFallback.getActivityLogs();
      const list = snap.docs.map((d) => d.data() as ActivityLogItem);
      localStoreFallback.saveSilent(STORAGE_KEYS.ACTIVITY, list);
      return list;
    } catch (err) {
      handleFirestoreError(err, "getActivityLogs");
      return localStoreFallback.getActivityLogs();
    }
  }

  async recordActivity(item: Omit<ActivityLogItem, "id" | "timestamp">): Promise<ActivityLogItem> {
    const newLog = await localStoreFallback.recordActivity(item);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            setDoc(doc(firestore, "activity_logs", newLog.id), sanitizeForFirestore(newLog)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "recordActivity cloud write");
        }
      })();
    }

    return newLog;
  }

  // --- SMS Logs ---

  async getSmsLogs(): Promise<SmsLogItem[]> {
    if (!firestore || isFirestoreQuotaExhausted()) return localStoreFallback.getSmsLogs();
    await this.ensureSeeded();
    try {
      const snap = await withFirestoreTimeout(
        getDocs(query(collection(firestore, "sms_logs"), orderBy("timestamp", "desc"), limit(50))),
        2500
      );
      if (snap.empty) return localStoreFallback.getSmsLogs();
      const list = snap.docs.map((d) => d.data() as SmsLogItem);
      localStoreFallback.saveSilent(STORAGE_KEYS.SMS, list);
      return list;
    } catch (err) {
      handleFirestoreError(err, "getSmsLogs");
      return localStoreFallback.getSmsLogs();
    }
  }

  private async recordSms(item: Omit<SmsLogItem, "id" | "timestamp">): Promise<SmsLogItem> {
    const newSms = await (localStoreFallback as any).recordSms(item);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            setDoc(doc(firestore, "sms_logs", newSms.id), sanitizeForFirestore(newSms)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "recordSms cloud write");
        }
      })();
    }

    return newSms;
  }

  async sendTestSms(recipientPhone: string, recipientName: string, message: string): Promise<SmsLogItem> {
    const item = await this.recordSms({
      recipientPhone,
      recipientName,
      messageText: message,
      status: "DELIVERED",
      trackingNumber: "TEST-DISPATCH",
      costEstimate: "₱0.40",
    });

    await this.recordActivity({
      type: "SMS_DISPATCHED",
      title: `Manual SMS Dispatch to ${recipientName}`,
      description: `Sent test message to ${recipientPhone}.`,
      actor: "Lobby Staff Admin",
      badgeColor: "bg-blue-500",
    });

    return item;
  }

  async getInquiries(): Promise<DeskInquiry[]> {
    if (!firestore || isFirestoreQuotaExhausted()) return localStoreFallback.getInquiries();
    await this.ensureSeeded();
    try {
      const snap = await withFirestoreTimeout(
        getDocs(query(collection(firestore, "inquiries"), orderBy("createdAt", "desc"), limit(50))),
        2500
      );
      if (snap.empty) return localStoreFallback.getInquiries();
      const list = snap.docs
        .map((d) => d.data() as DeskInquiry)
        .filter(
          (item) =>
            item.residentName !== "Juan Dela Cruz" &&
            item.residentName !== "Maria Santos" &&
            item.residentId !== "usr-resident-1" &&
            item.residentId !== "usr-resident-2"
        );
      localStoreFallback.save(STORAGE_KEYS.INQUIRIES, list);
      return list;
    } catch (err) {
      handleFirestoreError(err, "getInquiries");
      return localStoreFallback.getInquiries();
    }
  }

  async createInquiry(input: Omit<DeskInquiry, "id" | "createdAt" | "status">): Promise<DeskInquiry> {
    const newInquiry = await localStoreFallback.createInquiry(input);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            setDoc(doc(firestore, "inquiries", newInquiry.id), sanitizeForFirestore(newInquiry)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "createInquiry cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return newInquiry;
  }

  async updateInquiry(id: string, updates: Partial<DeskInquiry>): Promise<DeskInquiry> {
    const updated = await localStoreFallback.updateInquiry(id, updates);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            updateDoc(doc(firestore, "inquiries", id), sanitizeForFirestore(updates)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "updateInquiry cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus, adminReply?: string): Promise<DeskInquiry> {
    const updated = await localStoreFallback.updateInquiryStatus(id, status, adminReply);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            updateDoc(doc(firestore, "inquiries", id), sanitizeForFirestore({
              status,
              ...(adminReply ? { adminReply, repliedAt: new Date().toISOString() } : {}),
            })),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "updateInquiryStatus cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const res = await localStoreFallback.deleteInquiry(id);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(deleteDoc(doc(firestore, "inquiries", id)), 3000);
        } catch (err) {
          handleFirestoreError(err, "deleteInquiry cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return res;
  }

  // --- Hub Settings ---

  async getHubSettings(): Promise<HubSettings> {
    if (firestore && !isFirestoreQuotaExhausted()) {
      try {
        const snap = await withFirestoreTimeout(getDoc(doc(firestore, "settings", "default")), 2000);
        if (snap.exists()) {
          const loaded = snap.data() as HubSettings;
          const merged: HubSettings = {
            ...DEFAULT_HUB_SETTINGS,
            ...loaded,
            contactPhone: loaded.contactPhone || DEFAULT_HUB_SETTINGS.contactPhone,
            contactEmail: loaded.contactEmail || DEFAULT_HUB_SETTINGS.contactEmail,
            contactAddress: loaded.contactAddress || DEFAULT_HUB_SETTINGS.contactAddress,
            homeFaqs: loaded.homeFaqs && loaded.homeFaqs.length > 0 ? loaded.homeFaqs : DEFAULT_HUB_SETTINGS.homeFaqs,
            residentFaqs: loaded.residentFaqs && loaded.residentFaqs.length > 0 ? loaded.residentFaqs : DEFAULT_HUB_SETTINGS.residentFaqs,
            communityAnnouncements: loaded.communityAnnouncements && loaded.communityAnnouncements.length > 0 ? loaded.communityAnnouncements : DEFAULT_HUB_SETTINGS.communityAnnouncements,
          };
          localStoreFallback.saveSilent(STORAGE_KEYS.SETTINGS, merged);
          return merged;
        }
      } catch (err) {
        handleFirestoreError(err, "getHubSettings");
      }
    }
    return localStoreFallback.getHubSettings();
  }

  async updateHubSettings(updates: Partial<HubSettings>): Promise<HubSettings> {
    const updated = await localStoreFallback.updateHubSettings(updates);

    if (firestore && !isFirestoreQuotaExhausted()) {
      (async () => {
        try {
          await withFirestoreTimeout(
            setDoc(doc(firestore, "settings", "default"), sanitizeForFirestore(updated)),
            3000
          );
        } catch (err) {
          handleFirestoreError(err, "updateHubSettings cloud write");
        }
      })();
    }

    notifyLocalUpdate();
    return updated;
  }
}


/**
 * Real-time listener for residents collection from Firestore.
 * Allows Staff Admin to receive updates live across devices without refreshing.
 */
export function subscribeToResidents(callback: (residents: ResidentProfile[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "residents"),
        (snap) => {
          const list: ResidentProfile[] = [];
          snap.forEach((d) => {
            const data = d.data() as ResidentProfile;
            if (
              data.id !== "usr-resident-1" &&
              data.id !== "usr-resident-2" &&
              data.name !== "Juan Dela Cruz" &&
              data.name !== "Maria Santos"
            ) {
              list.push({ ...data, id: d.id });
            }
          });
          callback(list);
        },
        (err) => {
          handleFirestoreError(err, "subscribeToResidents onSnapshot");
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, "subscribeToResidents init");
    }
  }
  return () => { };
}

/**
 * Real-time listener for parcels collection from Firestore.
 * Allows residents and staff to receive package arrivals live across devices.
 */
export function subscribeToParcels(callback: (parcels: Parcel[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "parcels"),
        (snap) => {
          const list: Parcel[] = [];
          snap.forEach((d) => {
            const data = d.data() as Parcel;
            if (
              data.residentId !== "usr-resident-1" &&
              data.residentId !== "usr-resident-2" &&
              data.residentName !== "Juan Dela Cruz" &&
              data.residentName !== "Maria Santos"
            ) {
              list.push({ ...data, id: d.id });
            }
          });
          list.sort((a, b) => getParcelTimestamp(b) - getParcelTimestamp(a));
          const evaluated = syncParcelsOverdue(list);
          callback(evaluated);
        },
        (err) => {
          handleFirestoreError(err, "subscribeToParcels onSnapshot");
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, "subscribeToParcels init");
    }
  }
  return () => { };
}

/**
 * Real-time listener for Hub Settings (announcements, FAQs, store hours, contact info).
 * Pushes any changes saved by Admin on desktop to all open client and resident devices live via WebSocket.
 */
export function subscribeToHubSettings(callback: (settings: HubSettings) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        doc(firestore, "settings", "default"),
        (snap) => {
          if (snap.exists()) {
            const loaded = snap.data() as HubSettings;
            callback({
              ...DEFAULT_HUB_SETTINGS,
              ...loaded,
              contactPhone: loaded.contactPhone || DEFAULT_HUB_SETTINGS.contactPhone,
              contactEmail: loaded.contactEmail || DEFAULT_HUB_SETTINGS.contactEmail,
              contactAddress: loaded.contactAddress || DEFAULT_HUB_SETTINGS.contactAddress,
              homeFaqs: loaded.homeFaqs && loaded.homeFaqs.length > 0 ? loaded.homeFaqs : DEFAULT_HUB_SETTINGS.homeFaqs,
              residentFaqs: loaded.residentFaqs && loaded.residentFaqs.length > 0 ? loaded.residentFaqs : DEFAULT_HUB_SETTINGS.residentFaqs,
              communityAnnouncements: loaded.communityAnnouncements && loaded.communityAnnouncements.length > 0 ? loaded.communityAnnouncements : DEFAULT_HUB_SETTINGS.communityAnnouncements,
            });
          }
        },
        (err) => {
          handleFirestoreError(err, "subscribeToHubSettings onSnapshot");
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, "subscribeToHubSettings init");
    }
  }
  return () => { };
}

/**
 * Real-time listener for Desk Inquiries from residents.
 * Allows instant two-way synchronization between resident inquiries and staff responses.
 */
export function subscribeToInquiries(callback: (inquiries: DeskInquiry[]) => void): () => void {
  if (isFirebaseConfigured() && firestore) {
    try {
      const unsubscribe = onSnapshot(
        collection(firestore, "inquiries"),
        (snap) => {
          const list: DeskInquiry[] = [];
          snap.forEach((d) => {
            const item = d.data() as DeskInquiry;
            if (
              item.residentName !== "Juan Dela Cruz" &&
              item.residentName !== "Maria Santos" &&
              item.residentId !== "usr-resident-1" &&
              item.residentId !== "usr-resident-2"
            ) {
              list.push({ ...item, id: d.id });
            }
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(list);
        },
        (err) => {
          handleFirestoreError(err, "subscribeToInquiries onSnapshot");
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, "subscribeToInquiries init");
    }
  }
  return () => { };
}

/**
 * Real-time listener for a specific resident's profile document.
 * When staff verifies payment or modifies resident plan on desktop,
 * the resident's mobile phone updates live without needing a refresh or logout!
 */
export function subscribeToUserDoc(
  userId: string,
  callback: (resident: ResidentProfile | null) => void
): () => void {
  if (isFirebaseConfigured() && firestore && userId) {
    try {
      const unsubscribe = onSnapshot(
        doc(firestore, "residents", userId),
        (snap) => {
          if (snap.exists()) {
            callback(snap.data() as ResidentProfile);
          } else {
            callback(null);
          }
        },
        (err) => {
          handleFirestoreError(err, `subscribeToUserDoc onSnapshot (${userId})`);
        }
      );
      return unsubscribe;
    } catch (err) {
      handleFirestoreError(err, "subscribeToUserDoc init");
    }
  }
  return () => { };
}


/**
 * Automatically inspects browser localStorage for any resident or parcel records
 * created prior to cloud synchronization and transparently uploads them to Firestore.
 */
export async function autoMigrateLocalDataToFirestore(): Promise<{ migratedResidents: number; migratedParcels: number }> {
  if (typeof window === "undefined" || !isFirebaseConfigured() || !firestore || isFirestoreQuotaExhausted()) {
    return { migratedResidents: 0, migratedParcels: 0 };
  }

  // One-time execution guard: prevents repeating 750+ checks on every reload/tab open
  if (window.localStorage.getItem("ck_hub_migrated_v3") === "true") {
    return { migratedResidents: 0, migratedParcels: 0 };
  }

  let migratedResidents = 0;
  let migratedParcels = 0;

  try {
    // 1. Scan and migrate local resident accounts
    const residentStorageKeys = ["ck_hub_residents_v2", "ck_hub_residents_v1", "ck_residents"];
    for (const key of residentStorageKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (
              item &&
              item.id &&
              item.id !== "usr-resident-1" &&
              item.id !== "usr-resident-2" &&
              item.name !== "Juan Dela Cruz" &&
              item.name !== "Maria Santos"
            ) {
              const resDocRef = doc(firestore, "residents", item.id);
              const existingSnap = await getDoc(resDocRef);
              if (!existingSnap.exists()) {
                await setDoc(resDocRef, sanitizeForFirestore(item));

                // Also ensure mirrored users collection has the account
                const userDoc: AuthUser = {
                  id: item.id,
                  email: item.email || "",
                  name: item.name || "Resident",
                  phone: item.phone || "",
                  role: "resident",
                  unit: item.unit || "",
                  tower: item.tower || "Tower A",
                  branch: item.branch || "Malinta Branch",
                  buildingNumber: item.buildingNumber,
                  floorNumber: item.floorNumber,
                  unitNumber: item.unitNumber,
                  plan: item.plan || "PER_PARCEL",
                  planStatus: item.planStatus || "ACTIVE",
                  paymentMethod: item.paymentMethod || "CASH_COUNTER",
                  paymentReference: item.paymentReference,
                  residentCode: item.residentCode,
                  authorizedClaimants: item.authorizedClaimants || [],
                  createdAt: item.createdAt || new Date().toISOString(),
                };
                await setDoc(doc(firestore, "users", item.id), sanitizeForFirestore(userDoc));
                migratedResidents++;
                console.log(`[AutoMigrate] Uploaded resident ${item.name} (${item.id}) to Firestore`);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing key ${key}:`, err);
      }
    }

    // 2. Scan and migrate local parcels
    const parcelStorageKeys = ["ck_hub_parcels_v2", "ck_hub_parcels_v1", "ck_parcels"];
    for (const key of parcelStorageKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const p of parsed) {
            if (
              p &&
              p.id &&
              p.residentId !== "usr-resident-1" &&
              p.residentId !== "usr-resident-2" &&
              p.residentName !== "Juan Dela Cruz" &&
              p.residentName !== "Maria Santos"
            ) {
              const parcelDocRef = doc(firestore, "parcels", p.id);
              const existingSnap = await getDoc(parcelDocRef);
              if (!existingSnap.exists()) {
                await setDoc(parcelDocRef, sanitizeForFirestore(p));
                migratedParcels++;
                console.log(`[AutoMigrate] Uploaded parcel ${p.trackingNumber} (${p.id}) to Firestore`);
              }
            }
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing parcel key ${key}:`, err);
      }
    }

    // 3. Scan and migrate active local browser session (critical for mobile phones)
    const sessionKeys = ["ck_hub_session_v2", "ck_hub_session_v1"];
    for (const sKey of sessionKeys) {
      const sRaw = window.localStorage.getItem(sKey);
      if (!sRaw || sRaw === "null") continue;
      try {
        const sessionUser = JSON.parse(sRaw);
        if (
          sessionUser &&
          sessionUser.id &&
          sessionUser.role === "resident" &&
          sessionUser.id !== "usr-resident-1" &&
          sessionUser.id !== "usr-resident-2" &&
          sessionUser.name !== "Juan Dela Cruz" &&
          sessionUser.name !== "Maria Santos"
        ) {
          const resDocRef = doc(firestore, "residents", sessionUser.id);
          const existingSnap = await getDoc(resDocRef);
          if (!existingSnap.exists()) {
            const residentDoc: ResidentProfile = {
              id: sessionUser.id,
              name: sessionUser.name,
              email: sessionUser.email,
              phone: sessionUser.phone,
              unit: sessionUser.unit,
              tower: sessionUser.tower || "Tower A",
              branch: sessionUser.branch || "Malinta Branch",
              buildingNumber: sessionUser.buildingNumber,
              floorNumber: sessionUser.floorNumber,
              unitNumber: sessionUser.unitNumber,
              building: "CK Buildersville Condominium",
              plan: sessionUser.plan || "PER_PARCEL",
              pendingPlan: sessionUser.pendingPlan,
              planStatus: sessionUser.planStatus || "ACTIVE",
              paymentMethod: sessionUser.paymentMethod || "CASH_COUNTER",
              paymentReference: sessionUser.paymentReference,
              deliveryCreditsLeft: sessionUser.deliveryCreditsLeft || 0,
              residentCode: sessionUser.residentCode || `CK-${Math.floor(100000 + Math.random() * 900000)}`,
              authorizedClaimants: sessionUser.authorizedClaimants || [],
              activeParcelsCount: 0,
              totalParcelsReceived: 0,
              status: "ACTIVE",
              notifications: {
                smsArrival: true,
                smsReminder: true,
                emailDigest: true,
                promoUpdates: false,
              },
              createdAt: sessionUser.createdAt || new Date().toISOString(),
            };
            await setDoc(resDocRef, sanitizeForFirestore(residentDoc));
            await setDoc(doc(firestore, "users", sessionUser.id), sanitizeForFirestore(sessionUser));
            migratedResidents++;
            console.log(`[AutoMigrate] Uploaded resident from session ${sessionUser.name} (${sessionUser.id}) to Firestore`);
          }
        }
      } catch (err) {
        console.warn(`[AutoMigrate] Failed parsing session key ${sKey}:`, err);
      }
    }

    // 3. Purge any legacy demo inquiries from Firestore
    try {
      const inqSnap = await getDocs(collection(firestore, "inquiries"));
      for (const d of inqSnap.docs) {
        const item = d.data() as DeskInquiry;
        if (
          item.residentName === "Juan Dela Cruz" ||
          item.residentName === "Maria Santos" ||
          item.residentId === "usr-resident-1" ||
          item.residentId === "usr-resident-2"
        ) {
          await deleteDoc(d.ref);
          console.log(`[AutoMigrate] Purged legacy demo inquiry ${d.id}`);
        }
      }
    } catch (err) {
      console.warn("[AutoMigrate] Failed checking inquiries to purge:", err);
    }

    if (migratedResidents > 0 || migratedParcels > 0) {
      notifyLocalUpdate();
      console.log(`[AutoMigrate] Successfully migrated ${migratedResidents} resident(s) and ${migratedParcels} parcel(s) to Firestore`);
    }
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error?.code === "resource-exhausted" || error?.message?.includes("Quota exceeded")) {
      markFirestoreQuotaExhausted();
    }
    console.warn("[AutoMigrate] Exception during localStorage migration:", err);
  } finally {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("ck_hub_migrated_v3", "true");
    }
  }

  return { migratedResidents, migratedParcels };
}
