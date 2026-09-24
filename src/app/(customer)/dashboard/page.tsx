"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, useParcels } from "@/context";
import { Parcel } from "@/types";

export default function CustomerDashboardPage() {
  const { user, updateProfile } = useAuth();
  const { parcels } = useParcels();

  // Modal states
  const [selectedClaimParcel, setSelectedClaimParcel] = useState<Parcel | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"GCASH" | "CASH_COUNTER">("GCASH");
  const [gcashRef, setGcashRef] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

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

  // Filter parcels for current user
  const userParcels = parcels.filter(
    (p) => p.residentId === user?.id || (user?.name && p.residentName.toLowerCase() === user.name.toLowerCase())
  );

  const readyParcels = userParcels.filter((p) => p.status === "READY" || p.status === "OVERDUE");
  const overdueParcels = userParcels.filter((p) => p.status === "OVERDUE");
  const totalActive = readyParcels.length;

  const isPendingPayment = user?.planStatus === "PENDING_PAYMENT";
  const planPrice = user?.plan === "PREMIUM" ? "₱299/mo" : user?.plan === "REGULAR" ? "₱149/mo" : "₱15/claim";

  const deliveryCreditsText = isPendingPayment
    ? "Pending Payment"
    : user?.plan === "PREMIUM"
    ? "2 of 5 Left"
    : "0 (Pay-Per-Trip)";

  return (
    <div className="space-y-6">
      {/* Pending Payment Alert Banner */}
      {isPendingPayment && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                Action Required
              </span>
              <h3 className="font-bold text-sm text-gray-900">
                Membership Pending Payment: {user?.plan} Tier ({planPrice})
              </h3>
            </div>
            <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
              You registered under the <strong>{user?.plan} Plan</strong>. Please settle your subscription via GCash QR or pay at Station 1 Front Desk to activate free holding days and concierge delivery perks.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary btn-sm w-full sm:w-auto font-bold uppercase whitespace-nowrap"
            >
              Complete Payment
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

      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
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
                You currently have <strong className="text-white">{totalActive} parcel{totalActive > 1 ? "s" : ""} ready for pickup</strong> at Station 1 Front Desk.
                {overdueParcels.length > 0 && (
                  <span className="text-yellow-300 ml-1">
                    ({overdueParcels.length} parcel is past the free holding deadline).
                  </span>
                )}
              </>
            ) : (
              <>
                You have <strong className="text-white">0 parcels pending pickup</strong>. We will notify you by SMS as soon as couriers check in your deliveries.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/parcels" className="btn btn-primary btn-sm font-bold uppercase">
              View All Parcels ({totalActive})
            </Link>
            <Link
              href="/track"
              className="btn btn-outline btn-sm !text-white !border-white/40 hover:!bg-white/10 font-bold uppercase"
            >
              Track Incoming Parcel
            </Link>
          </div>
        </div>
      </div>

      {/* 3 Overview KPI Cards (Display Only, Not Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase font-semibold">Ready for Pickup</span>
          <div className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 mt-2">
            {totalActive} Parcel{totalActive === 1 ? "" : "s"}
          </div>
          <span className="text-xs text-green-700 font-semibold mt-1">Station 1 Front Desk</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase font-semibold">Door Delivery Credits</span>
          <div className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-gray-900 mt-2">
            {deliveryCreditsText}
          </div>
          <span className="text-xs text-blue-700 font-semibold mt-1">{user?.plan || "PREMIUM"} Tier</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase font-semibold">Holding Alert</span>
          <div className="font-[family-name:var(--font-heading)] text-3xl text-brand-red mt-2">
            {overdueParcels.length} Overdue
          </div>
          <span className="text-xs text-gray-500 mt-1">₱10/day holding rate</span>
        </div>
      </div>

      {/* Section 1: Packages Ready for Pickup (Adaptive layout based on content) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase text-gray-900">
            PACKAGES READY FOR PICKUP
          </h2>
          <Link
            href="/parcels"
            className="text-xs font-bold text-brand-red hover:underline uppercase"
          >
            Manage All Parcels →
          </Link>
        </div>

        {readyParcels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-gray-900">All Caught Up!</h3>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                You have 0 packages currently awaiting pickup at Station 1 Front Desk. We will send an SMS to {user?.phone || "your number"} the moment a courier registers a delivery.
              </p>
            </div>
            <Link
              href="/track"
              className="btn btn-outline btn-sm font-bold uppercase shrink-0"
            >
              Track Incoming Parcel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyParcels.map((parcel) => (
              <div
                key={parcel.id}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3 hover:border-gray-300 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: parcel.courierColor }}
                      />
                      <span className="font-bold text-xs text-gray-900">{parcel.courier}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded border border-gray-200">
                        {parcel.shelf}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        parcel.status === "OVERDUE"
                          ? "bg-red-50 text-brand-red border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {parcel.status === "OVERDUE" ? "Overdue" : "Ready"}
                    </span>
                  </div>

                  <div className="font-mono font-bold text-base text-gray-900">
                    {parcel.trackingNumber}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                    <span>Arrived: <strong className="text-gray-700">{parcel.dateArrived}</strong></span>
                    <span>Deadline: <strong className={parcel.status === "OVERDUE" ? "text-brand-red" : "text-gray-700"}>{parcel.deadline}</strong></span>
                    <span>Fee: <strong className={parcel.status === "OVERDUE" ? "text-brand-red" : "text-green-700"}>{parcel.holdingFee}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                      Claim Passcode
                    </span>
                    <span className="font-mono font-black text-xl text-brand-red tracking-wider">
                      {parcel.claimCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClaimParcel(parcel)}
                    className="btn btn-primary btn-sm font-bold uppercase whitespace-nowrap cursor-pointer"
                  >
                    View Claim QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Balanced 2-Column Grid for Station 1 Info & Hub Announcements (No Empty Whitespace) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Station 1 Pickup Location & Schedule */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
              PICKUP LOCATION & HOURS
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
              Station 1 Front Desk
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ground Floor Main Lobby • Concierge Service Counter
            </p>
          </div>

          <div className="text-xs space-y-2.5 text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Location:</span>
              <span className="font-semibold text-gray-900">Ground Floor Main Lobby</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Operating Schedule:</span>
              <span className="font-semibold text-gray-900">8:00 AM – 9:00 PM Daily</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Hotline Number:</span>
              <span className="font-semibold text-gray-900">0917 123 4567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Door Delivery:</span>
              <span className="font-semibold text-gray-900">Available at Station 1 Desk</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Present your 4-digit claim code or show your QR pass to the front desk receptionist upon parcel collection.
          </p>
        </div>

        {/* Box 2: Hub Announcements & Advisories */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
              COMMUNITY UPDATES
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
              HUB ANNOUNCEMENTS
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Latest parcel hub advisories and operations updates
            </p>
          </div>

          <div className="space-y-3 divide-y divide-gray-100 text-xs">
            <div className="pt-2 first:pt-0">
              <span className="text-[10px] text-brand-red font-bold uppercase">Oct 1, 2026</span>
              <h4 className="font-bold text-gray-900 mt-0.5">Flash Express Direct Sorting Added</h4>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Flash Express riders now drop packages directly into dedicated shelf bins at Station 1.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Sept 25, 2026</span>
              <h4 className="font-bold text-gray-900 mt-0.5">Holiday Schedule Advisory</h4>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Hub remains open for normal hours (8:00 AM – 9:00 PM) during upcoming public holidays.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Need Assistance?</span>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Visit our{" "}
                <Link href="/help" className="text-brand-red font-semibold hover:underline">
                  Resident Help Center
                </Link>{" "}
                for proxy claimant authorization rules and the holding fee calculator.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Code & QR Modal Popup */}
      {selectedClaimParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                PARCEL CLAIM PASS
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Show this verification code to the receptionist at Station 1
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-brand-red/40">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                YOUR UNIQUE PASSCODE
              </div>
              <div className="font-mono text-3xl font-black text-brand-red tracking-widest my-1">
                {selectedClaimParcel.claimCode}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Tracking: {selectedClaimParcel.trackingNumber}
              </div>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block shadow-inner">
              <div className="w-36 h-36 bg-gray-50 flex flex-col items-center justify-center rounded border border-gray-200">
                <svg className="w-28 h-28 text-gray-900" viewBox="0 0 100 100" fill="currentColor">
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
                <span className="text-[9px] text-gray-400 mt-1 uppercase font-semibold">
                  SCAN STATION 1
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              Shelf Location: <strong>{selectedClaimParcel.shelf}</strong>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Print Pass
              </button>
              <button
                type="button"
                onClick={() => setSelectedClaimParcel(null)}
                className="btn btn-primary btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Activation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 text-left animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Subscription Activation
                </span>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase mt-1">
                  SETTLE {user?.plan} PLAN
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
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
                {paymentNotice}
              </div>
            )}

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("GCASH")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "GCASH"
                    ? "bg-blue-50 border-[#005CEE] text-[#005CEE] ring-1 ring-[#005CEE]"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                GCash QR Code
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH_COUNTER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "CASH_COUNTER"
                    ? "bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-600"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                Cash at Desk
              </button>
            </div>

            {/* GCash Form */}
            {paymentMethod === "GCASH" ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center space-y-2">
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1">
                    <span className="text-gray-500">Account:</span>
                    <span className="font-bold text-gray-900">CK CONDO DROP HUB</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1">
                    <span className="text-gray-500">GCash Number:</span>
                    <span className="font-mono font-bold text-gray-900">0917 123 4567</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block shadow-inner mx-auto my-1">
                    <div className="w-32 h-32 bg-blue-50/50 flex flex-col items-center justify-center rounded border border-[#005CEE]/20 text-[#005CEE]">
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
                  <p className="text-[11px] text-gray-500">
                    Scan via GCash App and enter the reference number below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs text-gray-700">
                  <div className="font-bold text-sm text-gray-900">Station 1 Front Desk Instructions:</div>
                  <p className="text-gray-600">
                    Please visit Station 1 Front Desk in the Ground Floor Main Lobby during daily operational hours (8:00 AM – 9:00 PM).
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                    <div>• State your resident passcode: <strong className="font-mono text-brand-red">{user?.residentCode}</strong></div>
                    <div>• Inform receptionist you are paying for: <strong>{user?.plan} Membership</strong></div>
                    <div>• Amount: <strong className="text-green-700">{planPrice}</strong></div>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Once desk staff confirms your payment, your plan will be activated immediately.
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
