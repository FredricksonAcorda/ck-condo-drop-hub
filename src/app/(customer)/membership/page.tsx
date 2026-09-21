"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context";

interface Invoice {
  id: string;
  date: string;
  plan: string;
  amount: string;
  method: string;
  reference?: string;
  status: "PAID" | "PENDING";
}

export default function MembershipPage() {
  const { user, updateProfile } = useAuth();
  const currentPlan = user?.plan || "PREMIUM";
  const planStatus = user?.planStatus || "ACTIVE";
  const isPendingPayment = planStatus === "PENDING_PAYMENT";

  const [selectedPlanToSwitch, setSelectedPlanToSwitch] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM" | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"GCASH" | "CASH_COUNTER">(user?.paymentMethod || "GCASH");
  const [gcashRef, setGcashRef] = useState(user?.paymentReference || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const planPrices: Record<string, string> = {
    PER_PARCEL: "₱15 / claim",
    REGULAR: "₱149 / month",
    PREMIUM: "₱299 / month",
  };

  const holdingDays: Record<string, number> = {
    PER_PARCEL: 3,
    REGULAR: 3,
    PREMIUM: 7,
  };

  const doorCredits: Record<string, string> = {
    PER_PARCEL: "None (Pay-Per-Trip)",
    REGULAR: "None (Pay-Per-Trip)",
    PREMIUM: "5 Free Deliveries/mo (2 Left)",
  };

  // Sample resident billing history
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2026-0901",
      date: "Sept 1, 2026",
      plan: `${currentPlan.replace("_", " ")} Membership`,
      amount: currentPlan === "PREMIUM" ? "₱299.00" : currentPlan === "REGULAR" ? "₱149.00" : "₱0.00",
      method: user?.paymentMethod === "CASH_COUNTER" ? "Cash at Counter" : "GCash QR",
      reference: user?.paymentReference || "GC-9821-4402",
      status: isPendingPayment ? "PENDING" : "PAID",
    },
    {
      id: "INV-2026-0801",
      date: "Aug 1, 2026",
      plan: "Regular Membership",
      amount: "₱149.00",
      method: "GCash QR",
      reference: "GC-1029-3381",
      status: "PAID",
    },
  ]);

  const handleOpenSwitchModal = (plan: "PER_PARCEL" | "REGULAR" | "PREMIUM") => {
    setSelectedPlanToSwitch(plan);
    setShowPaymentModal(true);
  };

  const handleConfirmPlanPayment = async () => {
    const targetPlan = selectedPlanToSwitch || currentPlan;
    setIsProcessing(true);

    try {
      if (targetPlan === "PER_PARCEL") {
        await updateProfile({
          plan: "PER_PARCEL",
          planStatus: "ACTIVE",
          paymentMethod: "CASH_COUNTER",
        });
        setSuccessMessage("Switched to Per Parcel plan successfully!");
      } else if (paymentMethod === "GCASH") {
        if (!gcashRef.trim() || gcashRef.trim().length < 8) {
          alert("Please enter a valid GCash reference number (min. 8 digits).");
          setIsProcessing(false);
          return;
        }
        await updateProfile({
          plan: targetPlan,
          planStatus: "ACTIVE",
          paymentMethod: "GCASH",
          paymentReference: gcashRef.trim(),
        });
        setSuccessMessage(`Successfully updated to ${targetPlan} Plan via GCash!`);
      } else {
        await updateProfile({
          plan: targetPlan,
          planStatus: "PENDING_PAYMENT",
          paymentMethod: "CASH_COUNTER",
        });
        setSuccessMessage(`Switched to ${targetPlan} Plan. Please settle at Station 1 Front Desk.`);
      }

      // Add to invoices
      const newInvoice: Invoice = {
        id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: "Today",
        plan: `${targetPlan.replace("_", " ")} Membership`,
        amount: targetPlan === "PREMIUM" ? "₱299.00" : targetPlan === "REGULAR" ? "₱149.00" : "₱0.00",
        method: paymentMethod === "GCASH" ? "GCash QR" : "Cash at Counter",
        reference: paymentMethod === "GCASH" ? gcashRef.trim() : undefined,
        status: paymentMethod === "GCASH" || targetPlan === "PER_PARCEL" ? "PAID" : "PENDING",
      };
      setInvoices((prev) => [newInvoice, ...prev]);

      setShowPaymentModal(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      alert("Failed to update membership. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
            MEMBERSHIP & <span className="text-brand-red">BILLING</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your condo drop hub subscription, payment methods, and holding allowances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPendingPayment ? (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending Payment
            </span>
          ) : (
            <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Subscription
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Pending Payment Alert Card */}
      {isPendingPayment && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900">
              Your {currentPlan} Subscription is Awaiting Payment
            </h3>
            <p className="text-xs text-gray-600 max-w-xl">
              Please complete your {planPrices[currentPlan]} payment using GCash QR or visit Station 1 Front Desk to unlock your {holdingDays[currentPlan]}-day free holding period and doorstep deliveries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedPlanToSwitch(currentPlan);
              setShowPaymentModal(true);
            }}
            className="btn btn-primary btn-sm whitespace-nowrap font-bold uppercase cursor-pointer"
          >
            Pay Now via GCash / Counter
          </button>
        </div>
      )}

      {/* Current Active Plan Overview Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Current Plan • {user?.unit || "Unit 101"}
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl uppercase tracking-wide">
              {currentPlan.replace("_", " ")} <span className="text-brand-red">TIER</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg">
              {currentPlan === "PREMIUM"
                ? "Enjoy our highest tier with 7 days free storage grace period and 5 complimentary door-to-door concierge deliveries per month."
                : currentPlan === "REGULAR"
                ? "Enjoy automated SMS parcel alerts, 3 days free holding, and unlimited package drops at Station 1."
                : "Pay-as-you-go parcel drop service for occasional online shoppers."}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/70">Monthly Fee:</span>
              <span className="font-bold text-base text-white">{planPrices[currentPlan]}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
              <span className="text-white/70">Free Holding Allowance:</span>
              <span className="font-bold text-green-300">{holdingDays[currentPlan]} Days Free</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
              <span className="text-white/70">Door Deliveries:</span>
              <span className="font-bold text-white">{doorCredits[currentPlan]}</span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanToSwitch(currentPlan);
                  setShowPaymentModal(true);
                }}
                className="btn btn-outline btn-sm w-full !text-white !border-white/50 hover:!bg-white/20 font-bold uppercase cursor-pointer"
              >
                {isPendingPayment ? "Complete Payment" : "Manage / Renew"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tier Plan Cards Comparison */}
      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase text-gray-900">
          AVAILABLE MEMBERSHIP PLANS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Per Parcel */}
          <div
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              currentPlan === "PER_PARCEL"
                ? "border-brand-red ring-2 ring-brand-red/30 shadow-md"
                : "border-gray-200 hover:border-gray-300 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Per Parcel</h3>
                {currentPlan === "PER_PARCEL" && (
                  <span className="bg-brand-red text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 mb-1">
                ₱15 <span className="text-xs font-normal text-gray-500">/ claim</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Best for residents who only receive 1–2 deliveries a month.
              </p>

              <ul className="text-xs space-y-2.5 text-gray-700 border-t border-gray-100 pt-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> 3 Days Free Holding
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> SMS Arrival Notification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Pay only when you pick up
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>✕</span> No free door delivery credits
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentPlan === "PER_PARCEL" ? (
                <button disabled className="btn btn-outline btn-sm w-full opacity-60 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSwitchModal("PER_PARCEL")}
                  className="btn btn-outline btn-sm w-full font-bold uppercase cursor-pointer"
                >
                  Switch to Per Parcel
                </button>
              )}
            </div>
          </div>

          {/* Plan 2: Regular */}
          <div
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              currentPlan === "REGULAR"
                ? "border-brand-red ring-2 ring-brand-red/30 shadow-md"
                : "border-gray-200 hover:border-gray-300 shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Regular Plan</h3>
                {currentPlan === "REGULAR" && (
                  <span className="bg-brand-red text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 mb-1">
                ₱149 <span className="text-xs font-normal text-gray-500">/ month</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Ideal for frequent online shoppers and small families.
              </p>

              <ul className="text-xs space-y-2.5 text-gray-700 border-t border-gray-100 pt-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>Unlimited Parcels</strong> Stored
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> 3 Days Free Holding Grace
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Instant SMS & Claim Passcodes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Station 1 Priority Shelving
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentPlan === "REGULAR" ? (
                <button disabled className="btn btn-outline btn-sm w-full opacity-60 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSwitchModal("REGULAR")}
                  className="btn btn-outline btn-sm w-full font-bold uppercase cursor-pointer"
                >
                  Switch to Regular
                </button>
              )}
            </div>
          </div>

          {/* Plan 3: Premium */}
          <div
            className={`bg-[#FFFDF4] rounded-2xl border-2 p-6 flex flex-col justify-between transition-all relative ${
              currentPlan === "PREMIUM"
                ? "border-brand-red ring-2 ring-brand-red/30 shadow-md"
                : "border-amber-300 shadow-sm"
            }`}
          >
            <span className="absolute -top-2.5 right-6 bg-brand-red text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Most Popular
            </span>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Premium VIP</h3>
                {currentPlan === "PREMIUM" && (
                  <span className="bg-brand-red text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 mb-1">
                ₱299 <span className="text-xs font-normal text-gray-500">/ month</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Full-service package with extended holding and doorstep deliveries.
              </p>

              <ul className="text-xs space-y-2.5 text-gray-700 border-t border-amber-200 pt-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>7 Days Extended Free Holding</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>5 Free Door Deliveries / month</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Unlimited Package Drops
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> SMS & Dedicated Hotline Concierge
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentPlan === "PREMIUM" ? (
                <button disabled className="btn btn-primary btn-sm w-full opacity-60 cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenSwitchModal("PREMIUM")}
                  className="btn btn-primary btn-sm w-full font-bold uppercase cursor-pointer"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Invoice History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-[family-name:var(--font-heading)] text-lg text-gray-900 uppercase">
            PAYMENT & BILLING RECEIPTS
          </h3>
          <span className="text-xs text-gray-500">Official Receipts issued by CK Condo Hub</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5">Invoice #</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{inv.id}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.date}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.plan}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.method}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        inv.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800 animate-pulse"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="text-brand-red font-semibold hover:underline cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Payment / Switch Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 text-left animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Subscription Payment
                </span>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase mt-1">
                  {selectedPlanToSwitch ? `SWITCH TO ${selectedPlanToSwitch}` : `SETTLE ${currentPlan}`}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Amount Due:{" "}
                  <strong className="text-green-700 text-sm">
                    {planPrices[selectedPlanToSwitch || currentPlan]}
                  </strong>
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

            {/* Payment Method Tabs */}
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
                Cash at Counter
              </button>
            </div>

            {/* GCash Form */}
            {paymentMethod === "GCASH" ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center space-y-2">
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1">
                    <span className="text-gray-500">Merchant:</span>
                    <span className="font-bold text-gray-900">CK CONDO DROP HUB</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-200 pb-1">
                    <span className="text-gray-500">GCash Mobile:</span>
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
                    Scan using your GCash app and input your reference number below.
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
                  onClick={handleConfirmPlanPayment}
                  disabled={isProcessing}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  {isProcessing ? "Verifying..." : "Confirm Payment & Activate"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs text-gray-700">
                  <div className="font-bold text-sm text-gray-900">Front Desk Cashier:</div>
                  <p className="text-gray-600">
                    Please bring cash payment to Station 1 Front Desk (Ground Floor Lobby).
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-gray-200 space-y-1">
                    <div>• Resident Passcode: <strong className="font-mono text-brand-red">{user?.residentCode}</strong></div>
                    <div>• Plan Selected: <strong>{(selectedPlanToSwitch || currentPlan).replace("_", " ")}</strong></div>
                    <div>• Amount: <strong className="text-green-700">{planPrices[selectedPlanToSwitch || currentPlan]}</strong></div>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Your subscription will stay in Pending status until confirmed by reception staff.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlanPayment}
                  disabled={isProcessing}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  {isProcessing ? "Updating..." : "Save (Pay Cash at Front Desk)"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-center animate-in fade-in zoom-in-95">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                OFFICIAL RECEIPT
              </h3>
              <p className="text-xs text-gray-500">CK Condo Drop Hub • Buildersville Condominium</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-xs space-y-2 text-left border border-gray-200 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt #:</span>
                <span className="font-bold text-gray-900">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resident:</span>
                <span>{user?.name} ({user?.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan:</span>
                <span className="font-bold">{selectedInvoice.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span>{selectedInvoice.method}</span>
              </div>
              {selectedInvoice.reference && (
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Ref No:</span>
                  <span>{selectedInvoice.reference}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold">
                <span>Total Paid:</span>
                <span className="text-green-700">{selectedInvoice.amount}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-primary btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
