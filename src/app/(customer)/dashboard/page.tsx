"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useParcels } from "@/context";
import { Parcel } from "@/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "track" ? "track" : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "track">(initialTab);

  const { user, updateProfile } = useAuth();
  const { parcels, getParcelByTracking } = useParcels();

  // Keep activeTab in sync with query parameter
  useEffect(() => {
    if (searchParams.get("tab") === "track") {
      setActiveTab("track");
    }
  }, [searchParams]);

  // Payment Modal state for pending payment residents
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"GCASH" | "CASH_COUNTER">("GCASH");
  const [gcashRef, setGcashRef] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // In-Dashboard Parcel Tracking state
  const [trackQuery, setTrackQuery] = useState("SPX-PH-2026-8921");
  const [trackResult, setTrackResult] = useState<Parcel | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const executeLookup = useCallback(
    async (trackingNumber: string) => {
      if (!trackingNumber.trim()) return;
      setIsSearching(true);
      setHasSearched(true);
      try {
        const match = await getParcelByTracking(trackingNumber.trim());
        setTrackResult(match);
      } finally {
        setIsSearching(false);
      }
    },
    [getParcelByTracking]
  );

  // Auto-search initial number if in track tab
  useEffect(() => {
    if (activeTab === "track" && trackQuery) {
      executeLookup(trackQuery);
    }
  }, [activeTab, trackQuery, executeLookup]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(trackQuery);
  };

  const handleActivatePayment = async () => {
    setIsActivating(true);
    setPaymentNotice(null);
    try {
      if (paymentMethod === "GCASH") {
        if (!gcashRef.trim() || gcashRef.trim().length < 8) {
          setPaymentNotice("Please enter a valid GCash reference number (min. 8 digits).");
          setIsActivating(false);
          return;
        }
        await updateProfile({
          planStatus: "ACTIVE",
          paymentMethod: "GCASH",
          paymentReference: gcashRef.trim(),
        });
      } else {
        await updateProfile({
          planStatus: "PENDING_PAYMENT",
          paymentMethod: "CASH_COUNTER",
        });
      }
      setShowPaymentModal(false);
    } catch {
      setPaymentNotice("Failed to update payment status. Please try again.");
    } finally {
      setIsActivating(false);
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0].toUpperCase() : "RESIDENT";
  const unitInfo = user?.unit ? `${user.unit}, ${user.tower || "Tower A"}` : "Unit 101, Tower A";

  // Filter parcels for the current user
  const userParcels = parcels.filter(
    (p) => p.residentId === user?.id || (user?.name && p.residentName.toLowerCase() === user.name.toLowerCase())
  );

  const readyParcels = userParcels.filter((p) => p.status === "READY");
  const overdueParcels = userParcels.filter((p) => p.status === "OVERDUE");
  const totalActive = readyParcels.length + overdueParcels.length;

  const isPendingPayment = user?.planStatus === "PENDING_PAYMENT";
  const planPrice = user?.plan === "PREMIUM" ? "₱299/mo" : user?.plan === "REGULAR" ? "₱149/mo" : "₱15/claim";

  const deliveryCreditsText = isPendingPayment
    ? "Pending Payment"
    : user?.plan === "PREMIUM"
    ? "2 of 5 Left"
    : "0 Credits (Pay-Per-Trip)";

  return (
    <div className="space-y-6">
      {/* Top View Selector: Overview vs Track Parcel */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex gap-1.5 bg-brand-surface p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-brand-red shadow-sm"
                : "text-brand-text-secondary hover:text-brand-black"
            }`}
          >
            <span>🏠</span>
            <span>Dashboard Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "track"
                ? "bg-brand-red text-white shadow-sm"
                : "text-brand-text-secondary hover:text-brand-black"
            }`}
          >
            <span>🔍</span>
            <span>Track Parcel</span>
          </button>
        </div>

        <div className="text-xs text-brand-text-secondary pr-2 hidden sm:block">
          Unit: <strong className="text-brand-black">{unitInfo}</strong>
        </div>
      </div>

      {/* Pending Payment Alert Banner (If Resident has not yet paid for Premium or Regular) */}
      {isPendingPayment && (
        <div className="bg-amber-500/10 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-500 text-black font-black rounded-xl flex items-center justify-center shrink-0 text-lg">
              ⚠️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-brand-black">
                  Membership Pending Payment: {user?.plan} Tier ({planPrice})
                </h3>
                <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-brand-text-secondary mt-0.5 max-w-xl leading-relaxed">
                You registered under the <strong>{user?.plan} Plan</strong>. Please settle your subscription via GCash QR or pay in cash at the Ground Floor Front Desk counter to activate extended holding days and door delivery perks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary btn-sm w-full sm:w-auto font-bold uppercase whitespace-nowrap"
            >
              Complete Payment 💳
            </button>
            <Link
              href="/membership"
              className="btn btn-outline btn-sm font-bold uppercase whitespace-nowrap"
            >
              Details
            </Link>
          </div>
        </div>
      )}

      {/* View 1: Track Parcel (Integrated In-Dashboard Experience) */}
      {activeTab === "track" ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-brand-black via-brand-dark to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Resident Live Tracking Tool
              </span>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl mt-2 mb-2 tracking-wide uppercase">
                TRACK YOUR <span className="text-brand-red">PARCEL</span>
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Check whether your incoming courier parcel has checked in at Station 1 Front Desk without leaving your dashboard.
              </p>
            </div>
            <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
              <span className="font-[family-name:var(--font-heading)] text-[160px] font-black leading-none">
                TRACK
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter courier tracking number (e.g. SPX-PH-2026-8921)..."
                className="input text-base font-mono uppercase flex-1"
                required
                disabled={isSearching}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn btn-primary sm:w-44 py-3 font-bold uppercase cursor-pointer"
              >
                {isSearching ? "Searching..." : "Track Parcel 🔍"}
              </button>
            </form>

            {/* Quick Sample Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border text-xs text-brand-text-secondary">
              <span className="font-semibold text-brand-black">Quick Test Parcels:</span>
              {[
                { label: "SPX-PH-2026-8921 (Ready)", num: "SPX-PH-2026-8921" },
                { label: "JT-PH-9920148 (Ready)", num: "JT-PH-9920148" },
                { label: "FL-2026-58190 (Overdue)", num: "FL-2026-58190" },
                { label: "SPX-PH-2026-7734 (Claimed)", num: "SPX-PH-2026-7734" },
              ].map((sample) => (
                <button
                  key={sample.num}
                  type="button"
                  onClick={() => {
                    setTrackQuery(sample.num);
                    executeLookup(sample.num);
                  }}
                  className="text-brand-red font-mono font-semibold hover:underline bg-brand-surface px-2 py-0.5 rounded border border-brand-border cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Card */}
          {trackResult ? (
            <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-lg animate-in fade-in">
              <div className="bg-gradient-to-r from-brand-black to-brand-dark text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">
                    {trackResult.courier}
                  </span>
                  <div className="font-mono text-xl sm:text-2xl font-black tracking-wide text-white">
                    {trackResult.trackingNumber}
                  </div>
                </div>

                <span
                  className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase self-start sm:self-auto flex items-center gap-1.5 ${
                    trackResult.status === "PICKED_UP"
                      ? "bg-blue-600"
                      : trackResult.status === "OVERDUE"
                      ? "bg-brand-red"
                      : "bg-[#107C41]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {trackResult.status === "PICKED_UP"
                    ? "CLAIMED / RELEASED"
                    : trackResult.status === "OVERDUE"
                    ? "READY (OVERDUE)"
                    : "READY FOR PICKUP"}
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                    <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                      Storage Location
                    </span>
                    <div className="font-bold text-sm text-brand-black">{trackResult.shelf}</div>
                    <div className="text-brand-text-secondary">Station 1 Front Desk</div>
                  </div>

                  <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                    <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                      Holding Status & Fee
                    </span>
                    <div className="font-bold text-sm text-brand-black">
                      {trackResult.status === "PICKED_UP" ? "Completed" : `Deadline: ${trackResult.deadline}`}
                    </div>
                    <div
                      className={`font-semibold ${
                        trackResult.status === "OVERDUE" ? "text-brand-red" : "text-green-700"
                      }`}
                    >
                      {trackResult.holdingFee}
                    </div>
                  </div>

                  <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                    <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                      Recipient Unit
                    </span>
                    <div className="font-bold text-sm text-brand-black">{trackResult.unit}</div>
                    <div className="text-brand-text-secondary">{trackResult.residentName}</div>
                  </div>
                </div>

                {/* Stepper Timeline */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-black">
                    PACKAGE TIMELINE & CHECKPOINTS
                  </h4>
                  <div className="space-y-4 border-l-2 border-brand-red ml-3 pl-4 text-xs">
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-brand-red border-2 border-white" />
                      <span className="font-bold text-brand-black block">
                        Arrived & Checked In at CK Drop Hub
                      </span>
                      <span className="text-brand-text-secondary">{trackResult.dateArrived}</span>
                      <p className="text-brand-text-muted mt-0.5">
                        Logged into shelf slot {trackResult.shelf} for recipient unit {trackResult.unit}.
                      </p>
                    </div>

                    {trackResult.status === "PICKED_UP" ? (
                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                        <span className="font-bold text-brand-black block">
                          Picked Up & Released
                        </span>
                        <span className="text-brand-text-secondary">
                          {trackResult.claimedAt || "Released at Front Desk"}
                        </span>
                        <p className="text-brand-text-muted mt-0.5">
                          Claimed by {trackResult.claimedBy || "Resident"}.
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-white" />
                        <span className="font-semibold text-brand-text-secondary block">
                          Awaiting Resident Pickup
                        </span>
                        <span className="text-brand-text-muted">
                          Passcode: <strong className="font-mono text-brand-red">{trackResult.claimCode}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="text-xs text-brand-text-secondary">
                    Package matches your unit? You can view all your stored packages in My Parcels.
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("overview")}
                      className="btn btn-outline btn-sm font-bold uppercase cursor-pointer"
                    >
                      ← Back to Overview
                    </button>
                    <Link href="/parcels" className="btn btn-primary btn-sm font-bold uppercase">
                      Go to My Parcels →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="bg-white rounded-2xl border border-brand-border p-8 text-center space-y-3 shadow-md animate-in fade-in">
              <div className="text-4xl">🚚</div>
              <h3 className="font-bold text-base text-brand-black">Package Not Yet Arrived at Drop Hub</h3>
              <p className="text-xs text-brand-text-secondary max-w-md mx-auto">
                No record found for tracking number <span className="font-mono font-bold text-brand-black">&quot;{trackQuery}&quot;</span>. Your delivery rider may still be on the way to the condo.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  Return to Dashboard Overview
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* View 2: Dashboard Overview (Default) */
        <>
          {/* Welcome Hero Banner */}
          <div className="bg-gradient-to-r from-brand-black via-brand-dark to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Resident Portal • {unitInfo}
              </span>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl mt-2 mb-2 tracking-wide uppercase">
                WELCOME BACK, <span className="text-brand-red">{firstName}</span>
              </h1>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                {totalActive > 0 ? (
                  <>
                    You currently have <strong className="text-white">{totalActive} parcel{totalActive > 1 ? "s" : ""} ready for pickup</strong> at the Ground Floor Hub.
                    {overdueParcels.length > 0 && (
                      <span className="text-yellow-300 ml-1">
                        ({overdueParcels.length} parcel is past the free holding deadline).
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    You have <strong className="text-white">0 parcels pending pickup</strong>. We will notify you by SMS as soon as couriers drop off your deliveries.
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/parcels" className="btn btn-primary btn-sm">
                  VIEW READY PARCELS ({totalActive}) →
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveTab("track")}
                  className="btn btn-outline btn-sm !text-white !border-white/40 hover:!bg-white/10 cursor-pointer"
                >
                  TRACK PARCEL 🔍
                </button>
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
            <Link
              href="/parcels"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4 hover:border-brand-red transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                📦
              </div>
              <div>
                <span className="text-xs text-brand-text-secondary uppercase font-semibold">Ready for Pickup</span>
                <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-black">
                  {totalActive} Parcel{totalActive === 1 ? "" : "s"}
                </div>
              </div>
            </Link>

            <Link
              href="/membership"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4 hover:border-brand-red transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                🚚
              </div>
              <div>
                <span className="text-xs text-brand-text-secondary uppercase font-semibold">Door Delivery Credits</span>
                <div className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-brand-black">
                  {deliveryCreditsText}
                </div>
              </div>
            </Link>

            <Link
              href="/parcels"
              className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center gap-4 hover:border-brand-red transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-brand-red-bg text-brand-red rounded-xl flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                ⚠️
              </div>
              <div>
                <span className="text-xs text-brand-text-secondary uppercase font-semibold">Holding Alert</span>
                <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-red">
                  {overdueParcels.length} Overdue
                </div>
              </div>
            </Link>
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

                <button
                  type="button"
                  onClick={() => setActiveTab("track")}
                  className="bg-white p-5 rounded-xl border border-brand-border shadow-sm hover:border-brand-red transition-all group text-left cursor-pointer"
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
                </button>

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
                  <div className="pt-3 flex items-center justify-between">
                    <a href="tel:09171234567" className="text-xs font-bold text-brand-red hover:underline">
                      📞 0917 123 4567
                    </a>
                    <Link href="/help" className="text-xs text-brand-text-secondary hover:text-brand-black underline">
                      Help Center →
                    </Link>
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

                <div className="pt-3">
                  <span className="text-[10px] text-brand-text-muted font-bold uppercase">Need Assistance?</span>
                  <p className="text-brand-text-secondary mt-1 leading-relaxed">
                    Visit our{" "}
                    <Link href="/help" className="text-brand-red font-semibold hover:underline">
                      Resident Help Center
                    </Link>{" "}
                    for proxy rules and the holding fee calculator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payment Activation Modal (For Pending Payment status) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-brand-border space-y-5 text-left animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Subscription Activation
                </span>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-black uppercase mt-1">
                  SETTLE {user?.plan} PLAN
                </h3>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Amount Due: <strong className="text-green-700 text-sm">{planPrice}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {paymentNotice && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                ⚠️ {paymentNotice}
              </div>
            )}

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("GCASH")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "GCASH"
                    ? "bg-[#005CEE]/10 border-[#005CEE] text-[#005CEE] ring-1 ring-[#005CEE]"
                    : "bg-brand-surface border-brand-border text-brand-text-secondary"
                }`}
              >
                <span>📱</span>
                <span>GCash QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH_COUNTER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "CASH_COUNTER"
                    ? "bg-amber-100 border-amber-600 text-amber-900 ring-1 ring-amber-600"
                    : "bg-brand-surface border-brand-border text-brand-text-secondary"
                }`}
              >
                <span>🏢</span>
                <span>Cash at Desk</span>
              </button>
            </div>

            {/* GCash Form */}
            {paymentMethod === "GCASH" ? (
              <div className="space-y-4">
                <div className="bg-brand-surface p-4 rounded-xl border border-brand-border text-center space-y-2">
                  <div className="flex justify-between text-xs border-b border-brand-border pb-1">
                    <span className="text-brand-text-muted">Account:</span>
                    <span className="font-bold text-brand-black">CK CONDO DROP HUB</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-brand-border pb-1">
                    <span className="text-brand-text-muted">GCash Number:</span>
                    <span className="font-mono font-bold text-brand-black">0917 123 4567</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-brand-border inline-block shadow-inner mx-auto my-1">
                    <div className="w-32 h-32 bg-[#005CEE]/5 flex flex-col items-center justify-center rounded border border-[#005CEE]/20 text-[#005CEE]">
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="10" y="10" width="24" height="24" rx="2" />
                        <rect x="14" y="14" width="16" height="16" fill="white" />
                        <rect x="18" y="18" width="8" height="8" />
                        <rect x="66" y="10" width="24" height="24" rx="2" />
                        <rect x="70" y="14" width="16" height="16" fill="white" />
                        <rect x="74" y="18" width="8" height="8" />
                        <rect x="10" y="66" width="24" height="24" rx="2" />
                        <rect x="14" y="70" width="16" height="16" fill="white" />
                        <rect x="18" y="74" width="8" height="8" />
                        <rect x="42" y="10" width="12" height="12" />
                        <rect x="42" y="30" width="12" height="12" />
                        <rect x="42" y="50" width="12" height="12" />
                        <rect x="66" y="42" width="12" height="12" />
                        <rect x="66" y="66" width="12" height="12" />
                        <rect x="80" y="80" width="10" height="10" />
                        <rect x="50" y="76" width="10" height="14" />
                      </svg>
                      <span className="text-[8px] font-black uppercase text-[#005CEE]">SCAN GCASH QR</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-brand-text-secondary">
                    Scan via GCash App and enter the reference number below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text mb-1">
                    GCash Reference Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9023 8841 2910"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    className="input w-full font-mono text-sm"
                  />
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => setGcashRef("902388412910")}
                      className="text-[11px] text-brand-red hover:underline cursor-pointer"
                    >
                      Fill Sample Reference
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleActivatePayment}
                  disabled={isActivating}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  {isActivating ? "Verifying..." : "Verify & Activate Now"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-2 text-xs text-brand-text">
                  <div className="font-bold text-sm text-brand-black">Station 1 Front Desk Instructions:</div>
                  <p className="text-brand-text-secondary">
                    Please visit Station 1 Front Desk in the Ground Floor Main Lobby during daily operational hours (8:00 AM – 9:00 PM).
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-brand-border space-y-1">
                    <div>• State your resident passcode: <strong className="font-mono text-brand-red">{user?.residentCode}</strong></div>
                    <div>• Inform receptionist you are paying for: <strong>{user?.plan} Membership</strong></div>
                    <div>• Amount: <strong className="text-green-700">{planPrice}</strong></div>
                  </div>
                  <p className="text-brand-text-muted text-[11px]">
                    Once desk staff issues your official receipt, your plan will be confirmed as Active.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  Understood (I Will Pay At Desk)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-secondary">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
