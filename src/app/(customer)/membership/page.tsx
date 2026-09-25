"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/context";
import { getInvoicesByResident, recordInvoice } from "@/lib/db/invoices";
import { InvoiceRecord } from "@/types";

type Invoice = InvoiceRecord;

export default function MembershipPage() {
  const { user, updateProfile } = useAuth();
  const currentPlan = user?.plan || "PREMIUM";
  const planStatus = user?.planStatus || "ACTIVE";
  const isPendingPayment = planStatus === "PENDING_PAYMENT";

  const [selectedPlanToSwitch, setSelectedPlanToSwitch] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM" | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isRenewalMode, setIsRenewalMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"GCASH" | "CASH_COUNTER">(user?.paymentMethod || "GCASH");
  const [gcashRef, setGcashRef] = useState(user?.paymentReference || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const planPrices: Record<string, string> = {
    PER_PARCEL: "₱15 / claim",
    REGULAR: "₱149 / 15 days",
    PREMIUM: "₱299 / month (30 days)",
  };

  const holdingDays: Record<string, number> = {
    PER_PARCEL: 3,
    REGULAR: 3,
    PREMIUM: 7,
  };

  const doorCredits: Record<string, string> = {
    PER_PARCEL: "Not available",
    REGULAR: "Not available for Regular Plans",
    PREMIUM: `5 Free Deliveries/mo (${user?.deliveryCreditsLeft ?? 0} Left)`,
  };

  // Subscription expiration and renewal calculation
  const rawExpiry =
    user?.subscriptionExpiry ||
    (currentPlan === "PREMIUM"
      ? "2026-10-01T23:59:59Z"
      : currentPlan === "REGULAR"
      ? "2026-10-15T23:59:59Z"
      : null);

  const expiryDate = rawExpiry ? new Date(rawExpiry) : null;
  const today = new Date();
  const daysLeft = expiryDate
    ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formattedExpiry = expiryDate
    ? expiryDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No Expiration";

  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  // Persistent resident billing receipts
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const loadInvoices = async () => {
      const resId = user?.id || "usr-resident-1";
      const records = await getInvoicesByResident(resId);
      if (records && records.length > 0) {
        setInvoices(records);
      } else {
        const initial: Invoice[] = [
          {
            id: "INV-2026-0901",
            residentId: resId,
            residentName: user?.name || "Juan Dela Cruz",
            residentCode: user?.residentCode || "CK-000123",
            unit: user?.unit || "Unit 101",
            tower: user?.tower || "Tower A",
            date: "Sept 1, 2026",
            plan: `${currentPlan.replace("_", " ")} Membership`,
            amount: currentPlan === "PREMIUM" ? "₱299.00" : currentPlan === "REGULAR" ? "₱149.00" : "₱0.00",
            method: user?.paymentMethod === "CASH_COUNTER" ? "Cash at Counter" : "GCash QR",
            reference: user?.paymentReference || "GC-9821-4402",
            status: isPendingPayment ? "PENDING" : "PAID",
          },
          {
            id: "INV-2026-0801",
            residentId: resId,
            residentName: user?.name || "Juan Dela Cruz",
            residentCode: user?.residentCode || "CK-000123",
            unit: user?.unit || "Unit 101",
            tower: user?.tower || "Tower A",
            date: "Aug 1, 2026",
            plan: "Regular Membership",
            amount: "₱149.00",
            method: "GCash QR",
            reference: "GC-1029-3381",
            status: "PAID",
          },
        ];
        setInvoices(initial);
      }
    };

    loadInvoices();

    const handleUpdate = () => {
      loadInvoices();
    };
    window.addEventListener("ck_db_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ck_db_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [user?.id, user?.name, user?.residentCode, user?.unit, user?.tower, currentPlan, isPendingPayment, user?.paymentMethod, user?.paymentReference]);

  // 5-item pagination for Billing & Invoice History
  const [invoicePage, setInvoicePage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const totalInvoicePages = Math.ceil(invoices.length / ITEMS_PER_PAGE) || 1;
  const validInvoicePage = Math.min(Math.max(1, invoicePage), totalInvoicePages);
  const startInvIndex = (validInvoicePage - 1) * ITEMS_PER_PAGE;
  const endInvIndex = Math.min(startInvIndex + ITEMS_PER_PAGE, invoices.length);
  const paginatedInvoices = invoices.slice(startInvIndex, endInvIndex);

  const handleOpenSwitchModal = (plan: "PER_PARCEL" | "REGULAR" | "PREMIUM") => {
    setIsRenewalMode(false);
    setSelectedPlanToSwitch(plan);
    setShowPaymentModal(true);
  };

  const handleOpenRenewModal = () => {
    setIsRenewalMode(true);
    setSelectedPlanToSwitch(currentPlan);
    setShowPaymentModal(true);
  };

  const handleConfirmPlanPayment = async () => {
    const targetPlan = selectedPlanToSwitch || currentPlan;
    setIsProcessing(true);

    try {
      const now = new Date();
      const planDays = targetPlan === "REGULAR" ? 15 : 30;
      let newExpiryDate: Date;
      if (isRenewalMode && user?.subscriptionExpiry) {
        const curExp = new Date(user.subscriptionExpiry);
        if (curExp.getTime() > now.getTime()) {
          newExpiryDate = new Date(curExp.getTime() + planDays * 24 * 60 * 60 * 1000);
        } else {
          newExpiryDate = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000);
        }
      } else {
        newExpiryDate = new Date(now.getTime() + planDays * 24 * 60 * 60 * 1000);
      }

      const formattedNewDate = newExpiryDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (targetPlan === "PER_PARCEL") {
        await updateProfile({
          plan: "PER_PARCEL",
          planStatus: "ACTIVE",
          paymentMethod: "CASH_COUNTER",
          deliveryCreditsLeft: 0,
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
          subscriptionExpiry: newExpiryDate.toISOString(),
          deliveryCreditsLeft: targetPlan === "PREMIUM" ? 5 : 0,
        });
        setSuccessMessage(
          isRenewalMode
            ? `🎉 Subscription successfully renewed via GCash! Valid until ${formattedNewDate}.`
            : `Successfully activated ${targetPlan.replace("_", " ")} Plan via GCash! Valid until ${formattedNewDate}.`
        );
      } else {
        await updateProfile({
          plan: targetPlan,
          planStatus: "PENDING_PAYMENT",
          paymentMethod: "CASH_COUNTER",
          subscriptionExpiry: newExpiryDate.toISOString(),
        });
        setSuccessMessage(
          isRenewalMode
            ? `Renewal queued for ${targetPlan.replace("_", " ")} Plan. Please settle at Lobby.`
            : `Switched to ${targetPlan.replace("_", " ")} Plan. Please settle at Lobby.`
        );
      }

      // Add to centralized invoices database
      await recordInvoice({
        residentId: user?.id || "usr-resident-1",
        residentName: user?.name || "Juan Dela Cruz",
        residentCode: user?.residentCode || "CK-000123",
        unit: user?.unit || "Unit 101",
        tower: user?.tower || "Tower A",
        date: "Today",
        plan: isRenewalMode
          ? `${targetPlan.replace("_", " ")} ${targetPlan === "REGULAR" ? "15-Day" : "30-Day"} Renewal`
          : `${targetPlan.replace("_", " ")} Membership`,
        amount: targetPlan === "PREMIUM" ? "₱299.00" : targetPlan === "REGULAR" ? "₱149.00" : "₱0.00",
        method: paymentMethod === "GCASH" ? "GCash QR" : "Cash at Counter",
        reference: paymentMethod === "GCASH" ? gcashRef.trim() : undefined,
        status: paymentMethod === "GCASH" || targetPlan === "PER_PARCEL" ? "PAID" : "PENDING",
      });

      const updatedList = await getInvoicesByResident(user?.id || "usr-resident-1");
      setInvoices(updatedList);

      setShowPaymentModal(false);
      setIsRenewalMode(false);
      setTimeout(() => setSuccessMessage(null), 5000);
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
              Please complete your {planPrices[currentPlan]} payment using GCash QR or visit the Lobby to unlock your {holdingDays[currentPlan]}-day free holding period and package benefits.
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

      {/* Subscription Expiry & Renewal Reminder Card */}
      {currentPlan !== "PER_PARCEL" ? (
        <div
          className={`rounded-2xl border p-6 transition-all shadow-xs ${
            isExpired
              ? "bg-red-50/90 border-red-300 ring-2 ring-red-400/40"
              : isExpiringSoon
              ? "bg-gradient-to-br from-amber-50 via-orange-50/30 to-white border-amber-300 ring-2 ring-amber-300/40"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3.5">
              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-900 text-white">
                  {currentPlan.replace("_", " ")} PLAN
                </span>

                {isExpired ? (
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span>⚠️</span> EXPIRED ON {formattedExpiry}
                  </span>
                ) : isExpiringSoon ? (
                  <span className="bg-amber-500 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs animate-pulse">
                    <span>⏳</span> EXPIRING IN {daysLeft} DAY{daysLeft === 1 ? "" : "S"}
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span>✓</span> {daysLeft} DAYS REMAINING
                  </span>
                )}

                <span className="text-xs text-gray-500">
                  Current Expiry: <strong className="text-gray-900 font-semibold">{formattedExpiry}</strong>
                </span>
              </div>

              {/* Title & Guidance specifically addressing residents with regular parcels */}
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                  {isExpired
                    ? "SUBSCRIPTION EXPIRED — RENEW TO MAINTAIN 0-FEE PARCEL DROPS"
                    : isExpiringSoon
                    ? `SUBSCRIPTION EXPIRES ON ${formattedExpiry.toUpperCase()} — RENEWAL RECOMMENDED`
                    : `SUBSCRIPTION VALID UNTIL ${formattedExpiry.toUpperCase()}`}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  {isExpired
                    ? "Your membership period has expired. Inactive plans incur per-parcel handling fees (₱15/claim) and standard holding limits. Settle your renewal to reactivate unlimited free drops."
                    : isExpiringSoon
                    ? "Attention frequent online shoppers: If you regularly receive deliveries from Shopee, Lazada, or couriers, renew your subscription before expiration to ensure uninterrupted package intake at the Lobby, keep your extended holding grace, and preserve your delivery perks."
                    : "For residents who regularly receive parcels: Keeping your subscription active ensures seamless Lobby package receiving with 0 per-parcel claim fees, priority shelving, and doorstep delivery options."}
                </p>
              </div>

              {/* Benefits Status Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-white/80 border border-gray-200 rounded-xl p-2.5 text-xs">
                  <span className="text-gray-500 block text-[11px]">Unlimited Parcels</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {currentPlan === "REGULAR" ? "15 Days" : "30 Days"}
                  </span>
                </div>
                <div className="bg-white/80 border border-gray-200 rounded-xl p-2.5 text-xs">
                  <span className="text-gray-500 block text-[11px]">Parcel Pick-up Fee</span>
                  <span className="font-bold text-green-700 text-sm">₱0.00 Covered</span>
                </div>
                <div className="bg-white/80 border border-gray-200 rounded-xl p-2.5 text-xs">
                  <span className="text-gray-500 block text-[11px]">Free Holding Grace</span>
                  <span className="font-bold text-gray-900 text-sm">{holdingDays[currentPlan]} Days</span>
                </div>
                <div className="bg-white/80 border border-gray-200 rounded-xl p-2.5 text-xs">
                  <span className="text-gray-500 block text-[11px]">Door Deliveries Left</span>
                  <span className="font-bold text-brand-red text-sm">
                    {currentPlan === "PREMIUM" ? `${user?.deliveryCreditsLeft ?? 0} Free Runs` : "Not Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="shrink-0 flex flex-col gap-2.5 sm:min-w-[220px]">
              <button
                type="button"
                onClick={handleOpenRenewModal}
                className="btn btn-primary w-full py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>🔄</span>
                {isExpired ? "Reactivate Subscription" : isExpiringSoon ? "Renew Subscription Now" : "Extend / Renew Ahead"}
              </button>
              <p className="text-[11px] text-center text-gray-500">
                {planPrices[currentPlan]} via GCash QR or Cash at Lobby
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 transition-all shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gray-200 text-gray-800">
                  PER PARCEL (PAY-AS-YOU-GO)
                </span>
                <span className="text-xs text-gray-500">No recurring monthly charge</span>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                FREQUENTLY RECEIVE PARCELS? SAVE UP TO 70% WITH A MONTHLY PLAN
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                You are currently on pay-per-trip mode paying <strong>₱15 per parcel claim</strong>. If you receive 3 or more packages a month, subscribing to our <strong>Regular (₱149/mo)</strong> or <strong>Premium (₱299/mo)</strong> plan will save you money, grant longer holding allowances, and unlock free doorstep deliveries.
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-2 sm:min-w-[220px]">
              <button
                type="button"
                onClick={() => handleOpenSwitchModal("REGULAR")}
                className="btn btn-primary w-full py-3 text-sm font-bold uppercase tracking-wider cursor-pointer"
              >
                Subscribe to Monthly Plan
              </button>
              <p className="text-[11px] text-center text-gray-500">
                Instant activation via GCash QR
              </p>
            </div>
          </div>
        </div>
      )}

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
                ₱149 <span className="text-xs font-normal text-gray-500">/ 15 days</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                15 days unlimited parcels. Ideal for frequent online shoppers and small families.
              </p>

              <ul className="text-xs space-y-2.5 text-gray-700 border-t border-gray-100 pt-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>15 Days Unlimited Parcels</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>3 Days Free Holding Grace</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Instant SMS & Claim Passcodes
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> Lobby Priority Shelving
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span>✕</span> Door delivery not available (Upgrade to Premium)
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
                ₱299 <span className="text-xs font-normal text-gray-500">/ month (30 days)</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Full-service package with extended holding and doorstep deliveries.
              </p>

              <ul className="text-xs space-y-2.5 text-gray-700 border-t border-amber-200 pt-4">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>30 Days Unlimited Parcels</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>7 Days Extended Free Holding</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> <strong>5 Free Door Deliveries / month</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> SMS & Dedicated Staff Admin Hotline
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
              {paginatedInvoices.map((inv) => (
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

        {/* 5-Item Pagination Controls Footer */}
        {invoices.length > 5 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 font-medium">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {invoices.length === 0 ? 0 : startInvIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-900">{endInvIndex}</span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">{invoices.length}</span>{" "}
              records
              {totalInvoicePages > 1 && (
                <span className="ml-1 text-gray-400 font-semibold">
                  (Page {validInvoicePage} of {totalInvoicePages})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                disabled={validInvoicePage <= 1}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  validInvoicePage <= 1
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                }`}
                title="Previous page"
              >
                ← Prev
              </button>

              {Array.from({ length: totalInvoicePages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setInvoicePage(pageNum)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    validInvoicePage === pageNum
                      ? "bg-brand-red text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                disabled={validInvoicePage >= totalInvoicePages}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  validInvoicePage >= totalInvoicePages
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                }`}
                title="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Payment / Switch Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl border border-gray-200 space-y-5 text-left animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                {isRenewalMode
                  ? `RENEW ${(selectedPlanToSwitch || currentPlan).replace("_", " ")}`
                  : selectedPlanToSwitch
                  ? `SWITCH TO ${selectedPlanToSwitch.replace("_", " ")}`
                  : `SETTLE ${currentPlan.replace("_", " ")}`}
              </h3>
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

            {/* GCash Form: Option B (Full-size QR image on left, details on right) */}
            {paymentMethod === "GCASH" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                  {/* Left: Full QR Code Card Image (Image itself is the card box) */}
                  <div className="flex items-center justify-center">
                    <Image
                      src="/images/gcash-official-qr.jpg"
                      alt="Official GCash QR Code"
                      width={562}
                      height={795}
                      className="w-full h-auto rounded-2xl border border-gray-200 shadow-sm object-contain"
                      priority
                    />
                  </div>

                  {/* Right: Plan Breakdown & GCash Number Input */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Plan:</span>
                          <span className="font-bold text-gray-900">
                            {(selectedPlanToSwitch || currentPlan).replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-bold text-gray-900">
                            {(selectedPlanToSwitch || currentPlan) === "REGULAR" ? "15 Days Unlimited" : "30 Days Unlimited"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                          <span className="font-bold text-gray-700">Total Due:</span>
                          <span className="font-black text-xl text-emerald-600 font-[family-name:var(--font-heading)]">
                            {planPrices[selectedPlanToSwitch || currentPlan]}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          GCash Number (if QR can&apos;t be scanned)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your GCash Mobile Number"
                          value={gcashRef}
                          onChange={(e) => setGcashRef(e.target.value)}
                          className="input w-full font-mono text-sm"
                        />
                        <div className="flex justify-end mt-1">
                          <button
                            type="button"
                            onClick={() => setGcashRef("0917 123 4567")}
                            className="text-[11px] text-brand-red hover:underline cursor-pointer"
                          >
                            Fill Sample Number
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmPlanPayment}
                      disabled={isProcessing}
                      className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                    >
                      {isProcessing
                        ? "Verifying..."
                        : isRenewalMode
                        ? "Confirm Renewal"
                        : "Confirm Payment & Activate"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Cash at Counter Form */
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5 text-xs text-gray-700">
                  <div className="font-bold text-sm text-gray-900">Lobby Cashier:</div>
                  <p className="text-gray-600">
                    Please bring cash payment to the Lobby reception counter on the Ground Floor.
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Resident Passcode:</span>
                      <strong className="font-mono text-brand-red">{user?.residentCode}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plan:</span>
                      <strong>{(selectedPlanToSwitch || currentPlan).replace("_", " ")}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Due:</span>
                      <strong className="text-green-700">{planPrices[selectedPlanToSwitch || currentPlan]}</strong>
                    </div>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Your subscription will stay in Pending status until confirmed by Lobby Staff Admin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPlanPayment}
                  disabled={isProcessing}
                  className="btn btn-primary w-full py-3 font-bold uppercase cursor-pointer"
                >
                  {isProcessing
                    ? "Updating..."
                    : isRenewalMode
                    ? "Confirm Renewal at Lobby"
                    : "Save (Pay Cash at Lobby)"}
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
