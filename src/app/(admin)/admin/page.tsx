"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParcels } from "@/context";
import { ResidentProfile } from "@/types";
import { db } from "@/lib/db/local-store";

export default function AdminDashboardPage() {
  const { parcels, inquiries } = useParcels();
  const [residents, setResidents] = useState<ResidentProfile[]>([]);

  // Load residents count
  useEffect(() => {
    async function loadData() {
      try {
        const resList = await db.getAllResidents();
        setResidents(resList);
      } catch (err) {
        console.error("Failed to load residents:", err);
      }
    }
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("ck_db_updated", handleUpdate);
    return () => window.removeEventListener("ck_db_updated", handleUpdate);
  }, []);

  // Compute live KPIs
  const readyCount = parcels.filter((p) => p.status === "READY").length;
  const overdueCount = parcels.filter((p) => p.status === "OVERDUE").length;
  const pickedUpCount = parcels.filter((p) => p.status === "PICKED_UP").length;
  const pendingInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Station Banner */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 block">
            LOBBY COUNTER • ONLINE
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide mt-1">
            LOBBY <span className="text-brand-red">OPERATIONS</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Buildersville Condominium • Fast Inbound Barcode Scanning & Instant Resident Release
          </p>
        </div>
      </div>

      {/* Pending Inquiries Alert Banner */}
      {pendingInquiriesCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-xs text-amber-950 font-bold block">
              {pendingInquiriesCount} Unattended Resident Lobby Inquir{pendingInquiriesCount === 1 ? "y" : "ies"}
            </span>
            <span className="text-[11px] text-amber-800">
              Residents have sent messages regarding doorstep concierge deliveries, proxy authorizations, or hub questions.
            </span>
          </div>
          <Link
            href="/admin/inquiries"
            className="btn btn-primary btn-sm text-xs font-bold uppercase whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Review Inquiries ({pendingInquiriesCount})
          </Link>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/parcels"
          className="bg-white border-l-4 border-l-green-600 border border-brand-border rounded-xl p-5 shadow-sm hover:border-brand-border/80 hover:shadow-md transition-all group block"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            READY FOR PICKUP
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1 group-hover:text-green-700 transition-colors">
            {readyCount}
          </div>
          <span className="text-[11px] text-green-700 font-semibold mt-1 block">
            Active packages at counter
          </span>
        </Link>

        <Link
          href="/admin/parcels"
          className="bg-white border-l-4 border-l-brand-red border border-brand-border rounded-xl p-5 shadow-sm hover:border-brand-border/80 hover:shadow-md transition-all group block"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            OVERDUE STORAGE
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-red mt-1">
            {overdueCount}
          </div>
          <span className="text-[11px] text-brand-red font-semibold mt-1 block">
            {overdueCount > 0 ? "Subject to ₱20/day holding fee" : "None past holding limit"}
          </span>
        </Link>

        <Link
          href="/admin/parcels"
          className="bg-white border-l-4 border-l-blue-600 border border-brand-border rounded-xl p-5 shadow-sm hover:border-brand-border/80 hover:shadow-md transition-all group block"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            RELEASED / CLAIMED
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1 group-hover:text-blue-700 transition-colors">
            {pickedUpCount}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Handed over to residents
          </span>
        </Link>

        <Link
          href="/admin/customers"
          className="bg-white border-l-4 border-l-brand-dark border border-brand-border rounded-xl p-5 shadow-sm hover:border-brand-border/80 hover:shadow-md transition-all group block"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            REGISTERED RESIDENTS
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1 group-hover:text-brand-red transition-colors">
            {residents.length}
          </div>
          <span className="text-[11px] text-brand-text-secondary font-semibold mt-1 block">
            Active condo accounts & units
          </span>
        </Link>
      </div>

      {/* Quick Access Workstation Panels (Without icons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {/* Workstation 1: Parcel Inventory & Scanner */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all">
          <div className="space-y-2">
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
              PARCEL INVENTORY & SCANNER
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Unified barcode scanning terminal and live package registry. Scan inbound deliveries, release claimed packages, and search by 4-digit passcode.
            </p>
          </div>

          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-black">
              {readyCount} Ready • {overdueCount} Overdue
            </span>
            <Link
              href="/admin/parcels"
              className="btn btn-primary btn-sm text-xs font-bold uppercase cursor-pointer"
            >
              Open Workstation
            </Link>
          </div>
        </div>

        {/* Workstation 2: Residents, Units & Payments */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all">
          <div className="space-y-2">
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
              RESIDENTS & PAYMENT LOGS
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Complete resident directory by tower and unit. View subscription tiers, track GCash payment receipts, and verify Cash at Counter settlements.
            </p>
          </div>

          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-black">
              {residents.length} Registered Units
            </span>
            <Link
              href="/admin/customers"
              className="btn btn-outline btn-sm text-xs font-bold uppercase cursor-pointer"
            >
              View Directory & Logs
            </Link>
          </div>
        </div>

        {/* Workstation 3: Lobby Inquiries */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all md:col-span-2 lg:col-span-1">
          <div className="space-y-2">
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
              LOBBY RECEPTION INBOX
            </h3>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Resident communications hub. Respond to doorstep concierge delivery runs, proxy authorizations, and special holding instructions.
            </p>
          </div>

          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
            <span className="text-xs font-bold text-brand-black">
              {pendingInquiriesCount} New Inquiries
            </span>
            <Link
              href="/admin/inquiries"
              className="btn btn-outline btn-sm text-xs font-bold uppercase cursor-pointer"
            >
              Open Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
