"use client";

import { useState } from "react";
import { useAuth, useParcels } from "@/context";

export default function HelpCenterPage() {
  const { user } = useAuth();
  const { inquiries, sendInquiry } = useParcels();

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

  // Resident's Inquiries
  const myInquiries = inquiries.filter((inq) => inq.residentId === user?.id);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsSending(true);
    try {
      await sendInquiry({
        residentId: user.id,
        residentName: user.name,
        residentUnit: `${user.unit || "Unit 101"}, ${user.tower || "Tower A"}`,
        residentPhone: user.phone || "0917 123 4567",
        category,
        trackingNumber: trackingNum.trim() || undefined,
        message: message.trim(),
      });
      setSubmitted(true);
      setMessage("");
      setTrackingNum("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const faqs = [
    {
      q: "How do I claim my package at the Lobby?",
      a: "Proceed to the Lobby in the Ground Floor Main Lobby during operating hours (8:00 AM – 9:00 PM). Present your 4-digit parcel passcode (e.g. CK-8921) or show the QR code from your My Parcels tab. Our Staff Admin will verify the code and hand you your parcel immediately.",
    },
    {
      q: "Can my spouse, family member, or helper claim my parcels on my behalf?",
      a: "Yes! Go to My Account > Authorized Claimants and register their full name and mobile number. They can claim your packages by showing their valid government ID or condominium resident badge at the Lobby.",
    },
    {
      q: "What happens if I cannot claim my package within the free holding period?",
      a: "Parcels under Per-Parcel plans have 3 free calendar days, Regular plans enjoy 15 free calendar days, and Premium members enjoy 30 free calendar days. If a parcel remains unclaimed after the free holding period, a storage holding fee of ₱10.00 per day applies upon pickup.",
    },
    {
      q: "How does Door-to-Door Unit Delivery work?",
      a: "If you don't want to carry heavy boxes or are away from home, Premium subscribers can schedule a unit delivery from My Account. A Staff Admin will bring your package directly to your condo door during your chosen delivery window (Morning, Afternoon, or Evening). Premium members receive 5 complimentary door deliveries each month!",
    },
    {
      q: "What payment methods are accepted at the Lobby?",
      a: "We accept GCash QR (instant scanning), Maya QR, and Cash at the Lobby counter. You can pay holding fees, subscription renewals, or per-parcel drops on the spot.",
    },
    {
      q: "Which delivery couriers are supported by CK Condo Drop Hub?",
      a: "All major Philippine couriers deliver to our lobby daily, including Shopee Xpress (SPX), Lazada Express, J&T Express, Flash Express, LBC, Ninja Van, and DHL. Riders log packages directly into Lobby bins.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
          RESIDENT <span className="text-brand-red">HELP CENTER</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Lobby assistance, parcel retrieval policies, and fee calculator.
        </p>
      </div>

      {/* Grid: Fee Calculator & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Holding Fee Calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
              HOLDING FEE CALCULATOR
            </h3>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Estimate overdue storage charges before picking up your package. Free holding days depend on your active membership tier.
          </p>

          <div className="space-y-4">
            {/* Plan Tier Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                        ? "border-brand-red bg-red-50 text-brand-red font-bold"
                        : "border-gray-200 bg-white text-gray-600 hover:text-black"
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[10px] text-gray-500">{p.days} Days Free</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days Stored Slider / Buttons */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
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
              <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                <span>1 Day</span>
                <span>7 Days</span>
                <span>15 Days</span>
              </div>
            </div>

            {/* Calculation Result Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Free Grace Period:</span>
                <span className="font-bold text-green-700">{freeDaysAllowed} Days Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Days Overdue:</span>
                <span className={`font-bold ${overdueDays > 0 ? "text-brand-red" : "text-gray-900"}`}>
                  {overdueDays} Day{overdueDays === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rate per Overdue Day:</span>
                <span className="font-mono">₱10.00 / day</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold">
                <span className="text-gray-900">Total Holding Fee Due:</span>
                <span className={calculatedFee > 0 ? "text-brand-red text-base" : "text-green-700 text-base"}>
                  {calculatedFee > 0 ? `₱${calculatedFee}.00` : "₱0.00 (FREE)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Lobby Message Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
              SEND DESK INQUIRY
            </h3>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Have a question about a delayed parcel, proxy authorization, or doorstep delivery? Message the Lobby Staff Admin team.
          </p>

          {submitted && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <span>Your message has been dispatched to the Lobby! A Staff Admin will respond shortly.</span>
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
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
                <option>General Lobby Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Message to Staff Admin:
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
              {isSending ? "Sending to Lobby..." : "Send Message to Lobby"}
            </button>
          </form>

          {/* Resident's Sent Messages & Staff Replies */}
          {myInquiries.length > 0 && (
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                Your Past Inquiries & Staff Replies ({myInquiries.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {myInquiries.map((inq) => (
                  <div key={inq.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{inq.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inq.status === "RESOLVED"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : inq.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {inq.status.replace("_", " ")}
                      </span>
                    </div>
                    {inq.trackingNumber && (
                      <span className="font-mono text-[10px] text-gray-500 block">
                        Tracking: {inq.trackingNumber}
                      </span>
                    )}
                    <p className="text-gray-600 italic">"{inq.message}"</p>
                    <span className="text-[10px] text-gray-400 block">{inq.createdAt}</span>

                    {/* Staff Reply */}
                    {inq.adminReply && (
                      <div className="mt-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950 space-y-0.5">
                        <span className="font-bold text-[10px] text-emerald-800 flex items-center gap-1">
                          <span>✓</span> Lobby Staff Admin Reply:
                        </span>
                        <p className="text-[11px]">{inq.adminReply}</p>
                        {inq.updatedAt && (
                          <span className="text-[9px] text-emerald-700 block">{inq.updatedAt}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>

        <div className="space-y-3 divide-y divide-gray-200">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="pt-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 py-1 text-sm font-bold text-gray-900 hover:text-brand-red transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-brand-red font-bold text-lg">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-2 pb-2 animate-in fade-in">
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
