"use client";

import { useState } from "react";
import { useAuth } from "@/context";

export default function HelpCenterPage() {
  const { user } = useAuth();

  // Calculator State
  const [calcPlan, setCalcPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">(user?.plan || "PREMIUM");
  const [calcDays, setCalcDays] = useState(5);

  const freeDaysAllowed = calcPlan === "PREMIUM" ? 7 : 3;
  const overdueDays = Math.max(0, calcDays - freeDaysAllowed);
  const calculatedFee = overdueDays * 10;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Inquiry Form State
  const [category, setCategory] = useState("Missing / Misplaced Package");
  const [trackingNum, setTrackingNum] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
      setMessage("");
      setTrackingNum("");
      setTimeout(() => setSubmitted(false), 5000);
    }, 700);
  };

  const faqs = [
    {
      q: "How do I claim my package at Station 1 Front Desk?",
      a: "Proceed to Station 1 Front Desk in the Ground Floor Main Lobby during operating hours (8:00 AM – 9:00 PM). Present your 4-digit parcel passcode (e.g. CK-8921) or show the QR code from your My Parcels tab. Our receptionist will verify the code and hand you your parcel immediately.",
    },
    {
      q: "Can my spouse, family member, or helper claim my parcels on my behalf?",
      a: "Yes! Go to My Account > Authorized Claimants and register their full name and mobile number. They can claim your packages by showing their valid government ID or condominium resident badge at the front desk.",
    },
    {
      q: "What happens if I cannot claim my package within the free holding period?",
      a: "Parcels under Regular and Per-Parcel plans have 3 free calendar days, while Premium members enjoy 7 free calendar days. If a parcel remains unclaimed after the free holding period, a storage holding fee of ₱10.00 per day applies upon pickup.",
    },
    {
      q: "How does Door-to-Door Unit Delivery work?",
      a: "If you don't want to carry heavy boxes or are away from home, you can schedule a unit delivery from My Parcels or the Dashboard. A hub runner will bring your package directly to your condo door during your chosen delivery window (Morning, Afternoon, or Evening). Premium members receive 5 complimentary door deliveries each month!",
    },
    {
      q: "What payment methods are accepted at Station 1?",
      a: "We accept GCash QR (instant scanning), Maya QR, and Cash at the front desk counter. You can pay holding fees, subscription renewals, or per-parcel drops on the spot.",
    },
    {
      q: "Which delivery couriers are supported by CK Condo Drop Hub?",
      a: "All major Philippine couriers deliver to our hub daily, including Shopee Xpress (SPX), Lazada Express, J&T Express, Flash Express, LBC, Ninja Van, and DHL. Riders log packages directly into Station 1 bins.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-brand-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">❓</span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
              RESIDENT <span className="text-brand-red">HELP CENTER</span>
            </h1>
          </div>
          <p className="text-sm text-brand-text-secondary mt-1">
            Station 1 Front Desk assistance, parcel retrieval policies, and fee calculator.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:09171234567"
            className="btn btn-primary btn-sm font-bold uppercase flex items-center gap-2"
          >
            <span>📞</span>
            <span>Call Hotline: 0917 123 4567</span>
          </a>
        </div>
      </div>

      {/* Concierge Info Banner */}
      <div className="bg-gradient-to-r from-brand-black via-brand-dark to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Concierge Service Desk
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl uppercase tracking-wide">
              STATION 1 <span className="text-brand-red">FRONT RECEPTION</span>
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-lg">
              Located on the Ground Floor Main Lobby of Buildersville Condominium. Our reception team is available 7 days a week to receive, organize, and release your packages safely.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/70">Operating Hours:</span>
              <span className="font-bold text-white">Daily 8:00 AM – 9:00 PM</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/70">Weekend & Holidays:</span>
              <span className="font-bold text-green-300">Open Normal Hours</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/70">Support Email:</span>
              <span className="font-mono text-white">support@ckcondohub.com</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-white/70">Front Desk Staff:</span>
              <span className="font-bold text-brand-red">Officer on Duty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Fee Calculator & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Holding Fee Calculator */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <span className="text-xl">🧮</span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
              HOLDING FEE CALCULATOR
            </h3>
          </div>

          <p className="text-xs text-brand-text-secondary leading-relaxed">
            Estimate overdue storage charges before picking up your package. Free holding days depend on your active membership tier.
          </p>

          <div className="space-y-4">
            {/* Plan Tier Selector */}
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1.5">
                Select Your Membership Tier:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "PER_PARCEL" as const, label: "Per Parcel", days: 3 },
                  { id: "REGULAR" as const, label: "Regular", days: 3 },
                  { id: "PREMIUM" as const, label: "Premium", days: 7 },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCalcPlan(p.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      calcPlan === p.id
                        ? "border-brand-red bg-brand-red-bg text-brand-red font-bold"
                        : "border-brand-border bg-white text-brand-text-secondary hover:text-black"
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[10px] text-brand-text-muted">{p.days} Days Free</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days Stored Slider / Buttons */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-brand-text mb-1.5">
                <span>Days Parcel Stored in Hub:</span>
                <span className="text-brand-red font-bold text-sm">{calcDays} Day{calcDays === 1 ? "" : "s"}</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={calcDays}
                onChange={(e) => setCalcDays(Number(e.target.value))}
                className="w-full accent-brand-red cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-brand-text-muted mt-1 font-mono">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>15 Days</span>
              </div>
            </div>

            {/* Calculation Result Box */}
            <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Free Grace Period:</span>
                <span className="font-bold text-green-700">{freeDaysAllowed} Days Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Days Overdue:</span>
                <span className={`font-bold ${overdueDays > 0 ? "text-brand-red" : "text-brand-text"}`}>
                  {overdueDays} Day{overdueDays === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Rate per Overdue Day:</span>
                <span className="font-mono">₱10.00 / day</span>
              </div>
              <div className="flex justify-between border-t border-brand-border pt-2 text-sm font-bold">
                <span className="text-brand-black">Total Holding Fee Due:</span>
                <span className={calculatedFee > 0 ? "text-brand-red text-base" : "text-green-700 text-base"}>
                  {calculatedFee > 0 ? `₱${calculatedFee}.00` : "₱0.00 (FREE)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Concierge Message Form */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <span className="text-xl">✉️</span>
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
              SEND DESK INQUIRY
            </h3>
          </div>

          <p className="text-xs text-brand-text-secondary leading-relaxed">
            Have a question about a delayed parcel, proxy authorization, or doorstep delivery? Message the Station 1 desk team.
          </p>

          {submitted && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <span>✅</span>
              <span>Your message has been dispatched to Station 1 Front Desk! A concierge staff member will respond shortly.</span>
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Inquiry Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input w-full text-xs cursor-pointer"
                disabled={isSending}
              >
                <option>Missing / Misplaced Package</option>
                <option>Damaged Parcel Inspection</option>
                <option>Doorstep Delivery Request</option>
                <option>Authorized Proxy Claimant</option>
                <option>Holding Fee & Billing Question</option>
                <option>General Concierge Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Courier Tracking Number (Optional):
              </label>
              <input
                type="text"
                value={trackingNum}
                onChange={(e) => setTrackingNum(e.target.value)}
                placeholder="e.g. SPX-PH-2026-8921"
                className="input w-full font-mono text-xs uppercase"
                disabled={isSending}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Message to Desk Staff:
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your parcel inquiry or special instructions..."
                className="input w-full text-xs"
                required
                disabled={isSending}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn btn-primary btn-sm w-full font-bold uppercase cursor-pointer"
            >
              {isSending ? "Sending to Station 1..." : "Send Message to Concierge 📨"}
            </button>
          </form>
        </div>
      </div>

      {/* Comprehensive FAQs Accordion */}
      <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <span className="text-xl">💡</span>
          <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>

        <div className="space-y-3 divide-y divide-brand-border">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="pt-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 py-1 text-sm font-bold text-brand-black hover:text-brand-red transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-brand-red font-bold text-lg">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="text-xs text-brand-text-secondary leading-relaxed mt-2 pb-2 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
