"use client";

import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-brand-black via-brand-dark to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Resident Portal • Unit 101, Tower A
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl mt-2 mb-2 tracking-wide uppercase">
            WELCOME BACK, <span className="text-brand-red">JUAN</span>
          </h1>
          <p className="text-white/80 text-sm leading-relaxed mb-6">
            You currently have <strong className="text-white">3 parcels ready for pickup</strong> at the Ground Floor Hub. 1 parcel is nearing its free holding period.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/parcels" className="btn btn-primary btn-sm">
              VIEW READY PARCELS →
            </Link>
            <Link href="/track" className="btn btn-outline btn-sm !text-white !border-white/40 hover:!bg-white/10">
              TRACK NEW PARCEL
            </Link>
          </div>
        </div>

        {/* Decorative Badge Background */}
        <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
          <span className="font-[family-name:var(--font-heading)] text-[180px] font-black leading-none">
            HUB
          </span>
        </div>
      </div>

      {/* 3 Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl font-bold">
            📦
          </div>
          <div>
            <span className="text-xs text-brand-text-secondary uppercase font-semibold">Ready for Pickup</span>
            <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-black">3 Parcels</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold">
            🚚
          </div>
          <div>
            <span className="text-xs text-brand-text-secondary uppercase font-semibold">Door Delivery Credits</span>
            <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-black">2 of 5 Left</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-red-bg text-brand-red rounded-xl flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <div>
            <span className="text-xs text-brand-text-secondary uppercase font-semibold">Holding Alert</span>
            <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-red">1 Overdue</div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles & Recent Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Shortcuts */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase text-brand-black">
            FREQUENT ACTIONS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/parcels"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm hover:border-brand-red transition-all group"
            >
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center text-xl mb-3 group-hover:bg-brand-red-bg transition-colors">
                📦
              </div>
              <h3 className="font-bold text-sm text-brand-black group-hover:text-brand-red">
                My Ready Packages
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1">
                View claim barcodes, arrival timestamps, and shelf slot numbers.
              </p>
            </Link>

            <Link
              href="/track"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm hover:border-brand-red transition-all group"
            >
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center text-xl mb-3 group-hover:bg-brand-red-bg transition-colors">
                🔍
              </div>
              <h3 className="font-bold text-sm text-brand-black group-hover:text-brand-red">
                Track Tracking Number
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1">
                Check whether your Shopee, Lazada, or courier parcel has checked in at the hub.
              </p>
            </Link>

            <Link
              href="/account"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm hover:border-brand-red transition-all group"
            >
              <div className="w-10 h-10 bg-brand-surface rounded-lg flex items-center justify-center text-xl mb-3 group-hover:bg-brand-red-bg transition-colors">
                👤
              </div>
              <h3 className="font-bold text-sm text-brand-black group-hover:text-brand-red">
                Authorized Claimants
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1">
                Authorize family or helpers to retrieve packages using their ID.
              </p>
            </Link>

            <div className="bg-brand-surface p-5 rounded-xl border border-brand-border flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  HUB SERVICE DESK
                </span>
                <h4 className="font-bold text-sm text-brand-black mt-1">Operating Schedule</h4>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Daily: 8:00 AM – 9:00 PM (Including Public Holidays)
                </p>
              </div>
              <div className="pt-3">
                <span className="text-xs font-bold text-brand-red">📞 Reception: 0917 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Community Announcements */}
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black uppercase">
              HUB ANNOUNCEMENTS
            </h3>
          </div>

          <div className="space-y-3 divide-y divide-brand-border text-xs">
            <div className="pt-2 first:pt-0">
              <span className="text-[10px] text-brand-red font-bold uppercase">Oct 1, 2026</span>
              <h4 className="font-bold text-brand-black mt-0.5">Flash Express Direct Sorting Added</h4>
              <p className="text-brand-text-secondary mt-1 leading-relaxed">
                Flash Express riders now drop packages directly into dedicated shelf bins at Station 1.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-[10px] text-brand-text-muted font-bold uppercase">Sept 25, 2026</span>
              <h4 className="font-bold text-brand-black mt-0.5">Holiday Schedule Advisory</h4>
              <p className="text-brand-text-secondary mt-1 leading-relaxed">
                Hub will remain open for normal hours (8AM-9PM) during upcoming holidays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
