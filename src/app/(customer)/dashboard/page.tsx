"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth, useParcels } from "@/context";

export default function CustomerDashboardPage() {
  const { user, updateProfile } = useAuth();
  const { parcels } = useParcels();

  // Modal states
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
    ? `${user?.deliveryCreditsLeft ?? 0} of 5 Left`
    : user?.plan === "REGULAR"
    ? "Not available for Regular Plans"
    : "Not available for Per Parcel";

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
              You registered under the <strong>{user?.plan} Plan</strong>. Please settle your subscription via GCash QR or pay at the Lobby to activate free holding days and package perks.
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
                You currently have <strong className="text-white">{totalActive} parcel{totalActive > 1 ? "s" : ""} ready for pickup</strong> at the Lobby.
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
          <div>
            <Link href="/parcels" className="btn btn-primary btn-sm font-bold uppercase">
              View My Parcels ({totalActive})
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
          <span className="text-xs text-green-700 font-semibold mt-1">Lobby Counter</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-gray-500 uppercase font-semibold">Door Delivery Credits</span>
          <div className={`mt-2 ${user?.plan === "PREMIUM" ? "font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-gray-900" : "text-sm sm:text-base font-bold text-gray-700 leading-snug"}`}>
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

      {/* Lobby Pickup Location & Announcements (Balanced 2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Lobby Pickup Location & Schedule */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              Pickup Location & Hours
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl text-gray-900 uppercase">
              Lobby
            </h3>
            <p className="text-xs text-gray-500">
              Ground Floor Main Lobby • Service Counter
            </p>
          </div>

          <div className="text-xs space-y-3 text-gray-600 bg-gray-50 p-4 sm:p-5 rounded-xl border border-gray-200">
            <div className="flex justify-between border-b border-gray-200 pb-2.5">
              <span className="text-gray-500">Location:</span>
              <span className="font-semibold text-gray-900">Ground Floor Main Lobby</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2.5">
              <span className="text-gray-500">Operating Schedule:</span>
              <span className="font-semibold text-gray-900">8:00 AM – 9:00 PM Daily</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2.5">
              <span className="text-gray-500">Hotline Number:</span>
              <span className="font-semibold text-gray-900">0917 123 4567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Door Delivery:</span>
              <span className="font-semibold text-gray-900">{user?.plan === "PREMIUM" ? "Available (5 Runs/mo)" : "Exclusive to Premium"}</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
            Present your 4-digit claim code or show your QR pass from the <Link href="/parcels" className="text-brand-red font-semibold hover:underline">My Parcels</Link> tab to the Lobby Staff Admin upon parcel collection.
          </p>
        </div>

        {/* Box 2: Hub Announcements & Advisories */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
              Community Updates
            </span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl text-gray-900 uppercase">
              Hub Announcements
            </h3>
            <p className="text-xs text-gray-500">
              Latest parcel hub advisories and operations updates
            </p>
          </div>

          <div className="space-y-3.5 divide-y divide-gray-100 text-xs">
            <div className="pt-2 first:pt-0">
              <span className="text-[10px] text-brand-red font-bold uppercase">Oct 1, 2026</span>
              <h4 className="font-bold text-gray-900 mt-0.5">Flash Express Direct Sorting Added</h4>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Flash Express riders now drop packages directly into dedicated shelf bins at the Lobby.
              </p>
            </div>

            <div className="pt-3">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Sept 25, 2026</span>
              <h4 className="font-bold text-gray-900 mt-0.5">Holiday Schedule Advisory</h4>
              <p className="text-gray-600 mt-1 leading-relaxed">
                Lobby remains open for normal hours (8:00 AM – 9:00 PM) during upcoming public holidays.
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
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center space-y-2.5">
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1.5">
                    <span className="text-gray-500">Account Name:</span>
                    <span className="font-bold text-gray-900">DI**A P.</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1.5">
                    <span className="text-gray-500">GCash Mobile:</span>
                    <span className="font-mono font-bold text-gray-900">+63 993 267 ••••</span>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block shadow-sm mx-auto my-1">
                    <Image
                      src="/images/gcash-official-qr.jpg"
                      alt="Official GCash QR Code"
                      width={220}
                      height={440}
                      className="w-48 sm:w-52 h-auto rounded-lg object-contain mx-auto"
                      priority
                    />
                  </div>
                  <p className="text-[11px] text-gray-600 font-medium">
                    Scan via GCash App, send payment, and enter the reference number below.
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
                  <div className="font-bold text-sm text-gray-900">Lobby Counter Instructions:</div>
                  <p className="text-gray-600">
                    Please visit the Lobby (Ground Floor Main Lobby) during daily operational hours (8:00 AM – 9:00 PM).
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                    <div>• State your resident passcode: <strong className="font-mono text-brand-red">{user?.residentCode}</strong></div>
                    <div>• Inform Staff Admin you are paying for: <strong>{user?.plan} Membership</strong></div>
                    <div>• Amount: <strong className="text-green-700">{planPrice}</strong></div>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Once Lobby Staff Admin confirms your payment, your plan will be activated immediately.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  Understood (I Will Pay At Lobby)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
