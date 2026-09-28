"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context";
import { recordInvoice } from "@/lib/db/invoices";
import { PhilippinePhoneInput, GmailInput, SecurePasswordInput, isPasswordStrongEnough } from "@/components/ui";
import { isValidPhilippinePhone } from "@/lib/utils/phone-email";
import { BRANCHES } from "@/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  // Resident Profile State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState<string>("Malinta Branch");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [unitNumber, setUnitNumber] = useState("");

  // Membership State
  const [plan, setPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">("PREMIUM");

  // Payment Activation Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalMethod, setModalMethod] = useState<"GCASH" | "CASH_COUNTER">("GCASH");

  // Password & Security
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyGcashNumber = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("09932678000").catch(() => {});
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setErrorKey(Date.now());
  };

  // Auto-dismiss error banner after 7 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [errorMessage, errorKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !buildingNumber.trim() ||
      !floorNumber.trim() ||
      !unitNumber.trim()
    ) {
      triggerError("Please complete all required resident fields (Building #, Floor #, Unit #).");
      return;
    }

    if (!isValidPhilippinePhone(phone)) {
      triggerError("Please enter a valid Philippine mobile number (+63 9XX XXX XXXX).");
      return;
    }

    if (!email || !email.includes("@")) {
      triggerError("Please enter a valid email address (@gmail.com).");
      return;
    }

    if (!isPasswordStrongEnough(password)) {
      triggerError("Please ensure your password satisfies all 5 security complexity requirements.");
      return;
    }

    if (!agreeTerms) {
      triggerError("Please accept the condominium parcel holding terms to proceed.");
      return;
    }

    // Direct registration for free Per-Parcel plan; popup activation modal for paid tiers
    if (plan === "PER_PARCEL") {
      await executeRegistration("ACTIVE", "CASH_COUNTER", undefined);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleModalConfirm = async () => {
    await executeRegistration("PENDING_PAYMENT", modalMethod, undefined);
  };

  const executeRegistration = async (
    planStatus: "ACTIVE" | "PENDING_PAYMENT" | "PENDING_VERIFICATION",
    method: "GCASH" | "CASH_COUNTER",
    reference?: string
  ) => {
    setIsLoading(true);

    const fullUnitString = `Bldg ${buildingNumber.trim()} • Flr ${floorNumber.trim()} • Unit ${unitNumber.trim()}`;

    try {
      const isPaid = plan === "REGULAR" || plan === "PREMIUM";
      const registeredUser = await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        unit: fullUnitString,
        tower: branch,
        branch,
        buildingNumber: buildingNumber.trim(),
        floorNumber: floorNumber.trim(),
        unitNumber: unitNumber.trim(),
        plan: isPaid && planStatus !== "ACTIVE" ? "PER_PARCEL" : plan,
        pendingPlan: isPaid && planStatus !== "ACTIVE" ? plan : undefined,
        planStatus,
        paymentMethod: method,
        paymentReference: reference,
        password,
      });

      // Record invoice only for paid subscription tiers (Regular / Premium)
      if (isPaid) {
        await recordInvoice({
          residentId: registeredUser.id,
          residentName: registeredUser.name,
          residentCode: registeredUser.residentCode || "CK-000123",
          unit: registeredUser.unit || fullUnitString,
          tower: registeredUser.tower || branch,
          date: "Today",
          plan: `${plan.replace("_", " ")} Membership`,
          pendingPlan: plan,
          amount: plan === "PREMIUM" ? "₱299.00" : "₱149.00",
          method: method === "GCASH" ? "GCash QR" : "Cash at Counter",
          reference: reference || `COUNTER-${Date.now().toString().slice(-4)}`,
          status: "PENDING",
          notes: method === "GCASH" && reference ? "Pending GCash Verification" : "Pay at Lobby Counter",
        });
      }

      setShowPaymentModal(false);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account. Please try again.";
      triggerError(msg);
      setShowPaymentModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl bg-[#141416] rounded-3xl border border-white/[0.08] p-5 sm:p-6 lg:p-7 shadow-2xl overflow-hidden">
      {/* Top Red Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-16 bg-brand-red/20 blur-xl rounded-full pointer-events-none" />

      {/* Header - Compact Title and Subtitle (Logo removed since it is in top nav) */}
      <div className="text-center mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Create an Account
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed max-w-md mx-auto">
          Register your unit for 24/7 secure parcel holding & instant SMS arrival alerts
        </p>
      </div>

      {/* Error Alert Banner - Text only, auto-dismisses after 7s with visual countdown, no dismiss button */}
      {errorMessage && (
        <div
          role="alert"
          key={errorKey}
          className="relative mb-3 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs text-center leading-relaxed overflow-hidden animate-in fade-in"
        >
          <p>{errorMessage}</p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-900/40">
            <div
              className="h-full bg-red-500/80 transition-all ease-linear"
              style={{
                animation: "errorCountdown 7s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      {/* Registration Form - Responsive 2-Column Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* LEFT COLUMN: Resident Profile & Password */}
          <div className="lg:col-span-7 space-y-2.5">
            <div className="border-b border-zinc-800/80 pb-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Resident & Unit Profile
              </h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                Full Name <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="e.g. Full Name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            {/* Mobile Number & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                  Mobile Number <span className="text-brand-red">*</span>
                </label>
                <PhilippinePhoneInput
                  value={phone}
                  onChange={(formatted) => {
                    setPhone(formatted);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  theme="dark"
                  placeholder="+63 9XX XXX XXXX"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                  Gmail Account <span className="text-brand-red">*</span>
                </label>
                <GmailInput
                  value={email}
                  onChange={(formattedEmail) => {
                    setEmail(formattedEmail);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  theme="dark"
                  placeholder="username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Condominium Branch Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                Condominium Branch <span className="text-brand-red">*</span>
              </label>
              <select
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b} className="bg-[#1c1c21] text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* 3-Part Unit Details (Building, Floor, Unit) */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                Unit Specification <span className="text-brand-red">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Bldg #"
                    value={buildingNumber}
                    onChange={(e) => {
                      setBuildingNumber(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Floor #"
                    value={floorNumber}
                    onChange={(e) => {
                      setFloorNumber(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Unit #"
                    value={unitNumber}
                    onChange={(e) => {
                      setUnitNumber(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Secure Password Creation */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-0.5">
                Create Password <span className="text-brand-red">*</span>
              </label>
              <SecurePasswordInput
                value={password}
                onChange={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Create a strong password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Digital Resident Pass & Membership Selection (Layout 3) */}
          <div className="lg:col-span-5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="border-b border-zinc-800/80 pb-1.5 mb-2.5 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Choose Membership Plan
                </h2>
                <span className="text-[10px] text-zinc-500 font-mono">Live Pass Preview</span>
              </div>

              {/* Segmented 3-Pill Plan Switcher */}
              <div className="grid grid-cols-3 gap-1 bg-[#1c1c21] p-1 rounded-xl border border-zinc-800/80 mb-2.5">
                <button
                  type="button"
                  onClick={() => setPlan("PER_PARCEL")}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                    plan === "PER_PARCEL"
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Per Parcel
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("REGULAR")}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                    plan === "REGULAR"
                      ? "bg-[#005CEE] text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Regular
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("PREMIUM")}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer ${
                    plan === "PREMIUM"
                      ? "bg-brand-red text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Premium VIP
                </button>
              </div>

              {/* Digital Resident Pass Card Preview */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1c1c22] via-[#16161b] to-[#111115] border border-white/10 p-3.5 shadow-lg overflow-hidden space-y-2.5">
                {/* Top Subtle Gradient Rim */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] transition-colors ${
                    plan === "PREMIUM"
                      ? "bg-gradient-to-r from-brand-red via-amber-400 to-brand-red"
                      : plan === "REGULAR"
                      ? "bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500"
                      : "bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-600"
                  }`}
                />

                {/* Pass Header */}
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        plan === "PREMIUM"
                          ? "bg-amber-400"
                          : plan === "REGULAR"
                          ? "bg-blue-400"
                          : "bg-zinc-400"
                      }`}
                    />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                      CK Resident Pass
                    </span>
                  </div>
                  <span
                    className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      plan === "PREMIUM"
                        ? "bg-brand-red/20 text-brand-red border border-brand-red/30"
                        : plan === "REGULAR"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {plan === "PREMIUM"
                      ? "VIP Member"
                      : plan === "REGULAR"
                      ? "15-Day Pass"
                      : "Pay Per Claim"}
                  </span>
                </div>

                {/* Resident Identity Live Display */}
                <div className="bg-[#121216]/80 rounded-xl p-2.5 border border-white/5 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-zinc-500 font-medium">Cardholder:</span>
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {fullName.trim() || "Your Name"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-zinc-500 font-medium">Unit:</span>
                    <span className="text-[11px] font-mono text-zinc-300">
                      {buildingNumber.trim() || floorNumber.trim() || unitNumber.trim()
                        ? `Bldg ${buildingNumber.trim() || "—"} • Flr ${floorNumber.trim() || "—"} • Unit ${unitNumber.trim() || "—"}`
                        : "Unit Not Set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-zinc-500 font-medium">Branch:</span>
                    <span className="text-[10.5px] text-zinc-400 truncate max-w-[180px]">
                      {branch}
                    </span>
                  </div>
                </div>

                {/* Dynamic Tier Benefits */}
                <div className="space-y-1 text-[10.5px] text-zinc-300 px-0.5">
                  {plan === "PER_PARCEL" && (
                    <>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>₱0 monthly fee — pay ₱15 only when claiming</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>24/7 lobby drop-off intake & security holding</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Instant SMS parcel arrival alerts</span>
                      </div>
                    </>
                  )}
                  {plan === "REGULAR" && (
                    <>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-blue-400 font-bold">✓</span>
                        <span>15 Days unlimited parcel deliveries</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-blue-400 font-bold">✓</span>
                        <span>3 Days free storage holding window</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-blue-400 font-bold">✓</span>
                        <span>Priority SMS arrival notifications</span>
                      </div>
                    </>
                  )}
                  {plan === "PREMIUM" && (
                    <>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>30 Days unlimited parcel intake & VIP shelf</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>7 Days extended free holding period</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-amber-400 font-bold">✓</span>
                        <span>1 Free monthly door-to-door delivery credit</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Total Due Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[11px] text-zinc-400 font-medium">Total Due Today:</span>
                  <span className="text-sm font-black text-emerald-400 font-[family-name:var(--font-heading)]">
                    {plan === "PER_PARCEL"
                      ? "₱0.00 (Free Sign Up)"
                      : plan === "REGULAR"
                      ? "₱149 / 15 Days"
                      : "₱299 / Month"}
                  </span>
                </div>
              </div>

              {/* Plan Activation Subtext */}
              <p className="text-[10.5px] text-zinc-400 leading-tight mt-2">
                {plan === "PER_PARCEL"
                  ? "Free immediate registration. Pay ₱15 per package during desk pickup."
                  : "Payment activation will pop up next. Settle via GCash QR or Cash at Counter."}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-1">
              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-brand-red focus:ring-brand-red w-3.5 h-3.5 cursor-pointer"
                  required
                  disabled={isLoading}
                />
                <span className="leading-tight">
                  I agree to the Condominium Parcel Holding Policy and SMS notifications.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center cursor-pointer disabled:opacity-75"
              >
                {isLoading ? "Creating your account..." : "Create Resident Account"}
              </button>

              {/* Centered Sign In Link */}
              <div className="text-center">
                <p className="text-xs text-zinc-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-brand-red hover:underline font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>

              {/* Terms & Privacy */}
              <p className="text-[10px] sm:text-[10.5px] text-zinc-500 text-center leading-tight">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-zinc-400 underline hover:text-zinc-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-zinc-400 underline hover:text-zinc-300">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Copyright */}
              <p className="text-[9.5px] sm:text-[10px] text-zinc-600 text-center font-medium">
                © 2026 CK Condo Drop Hub • Buildersville Condominium Community Platform
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Payment Activation Modal Popup - Combined Dark Glassmorphic with 1-Tap Copy & strictly no icons */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#141418] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-left overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Red Rim Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl text-white uppercase font-bold tracking-tight">
                  ACTIVATE {plan} MEMBERSHIP
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Buildersville Lobby Drop Hub • Ground Floor Desk
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer text-lg leading-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Switcher Tabs - Strictly text-only, no icons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModalMethod("GCASH")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                  modalMethod === "GCASH"
                    ? "bg-[#005CEE] text-white border-[#005CEE] shadow-md"
                    : "bg-[#1c1c22] text-zinc-400 hover:text-white border-zinc-800"
                }`}
              >
                GCash QR Code
              </button>
              <button
                type="button"
                onClick={() => setModalMethod("CASH_COUNTER")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                  modalMethod === "CASH_COUNTER"
                    ? "bg-amber-600 text-white border-amber-600 shadow-md"
                    : "bg-[#1c1c22] text-zinc-400 hover:text-white border-zinc-800"
                }`}
              >
                Cash at Counter
              </button>
            </div>

            {/* GCash View: Full-size QR Card with 1-Tap Copy on left, Subscription breakdown on right */}
            {modalMethod === "GCASH" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-stretch">
                  {/* Left: Full QR Code Card Image + 1-Tap Copy Button */}
                  <div className="rounded-2xl border border-zinc-800 p-3 sm:p-4 bg-white flex flex-col items-center justify-between shadow-lg space-y-3">
                    <Image
                      src="/images/gcash-official-qr.jpg"
                      alt="Official GCash QR Code"
                      width={562}
                      height={795}
                      className="w-full h-auto rounded-xl object-contain"
                      priority
                    />
                    <button
                      type="button"
                      onClick={handleCopyGcashNumber}
                      className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold tracking-wide transition-all border border-zinc-700 cursor-pointer text-center select-none"
                    >
                      {isCopied ? "GCash Number Copied!" : "Copy GCash Number"}
                    </button>
                  </div>

                  {/* Right: Plan Breakdown, GCash Number Input, and Action Button */}
                  <div className="flex flex-col justify-between space-y-3">
                    <div className="space-y-3">
                      {/* Subscription Summary Box */}
                      <div className="bg-[#1a1a20] p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Plan:</span>
                          <span className="font-bold text-white uppercase">{plan}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Duration:</span>
                          <span className="font-bold text-white">
                            {plan === "REGULAR" ? "15 Days Unlimited" : "30 Days Unlimited"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-400">Account Status:</span>
                          <span className="font-semibold text-amber-400">Active (Pending Settle)</span>
                        </div>
                        <div className="flex justify-between items-center pt-2.5 border-t border-zinc-800">
                          <span className="font-bold text-zinc-300">Total Due:</span>
                          <span className="font-black text-xl text-emerald-400 font-[family-name:var(--font-heading)]">
                            {plan === "REGULAR" ? "₱149 / 15 DAYS" : "₱299 / 30 DAYS"}
                          </span>
                        </div>
                      </div>

                      {/* Payment Instructions */}
                      <div className="bg-[#1a1a20] p-4 rounded-2xl border border-zinc-800 space-y-1.5 text-xs">
                        <div className="font-semibold text-white">Payment Instructions:</div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          Scan the QR code via your GCash app or tap Copy GCash Number to send payment. Your account is created immediately and your chosen plan will be confirmed by staff.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleModalConfirm}
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] text-white font-bold uppercase tracking-wider text-sm transition-all shadow-md cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? "CREATING ACCOUNT..." : "CONFIRM PAYMENT & ACTIVATE"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Cash at Counter Form - Dark Glassmorphic */
              <div className="space-y-4">
                <div className="bg-[#1a1a20] p-5 rounded-2xl border border-zinc-800 space-y-3 text-xs text-zinc-300">
                  <div className="font-bold text-sm text-white">Lobby Cashier Payment:</div>
                  <p className="text-zinc-400 leading-relaxed">
                    Please bring cash payment to the Buildersville Lobby Drop Hub counter on the Ground Floor during package claim or your next lobby visit.
                  </p>
                  <div className="p-3.5 bg-[#141418] rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Resident Name:</span>
                      <strong className="text-white">{fullName || "Resident"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Plan:</span>
                      <strong className="text-white uppercase">{plan} Membership</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Duration:</span>
                      <strong className="text-white">{plan === "REGULAR" ? "15 Days Unlimited" : "30 Days Unlimited"}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">Amount Due:</span>
                      <strong className="text-emerald-400 font-bold text-sm">
                        {plan === "REGULAR" ? "₱149.00" : "₱299.00"}
                      </strong>
                    </div>
                  </div>
                  <p className="text-amber-400 text-[11px] font-medium">
                    Your account will be created immediately. Your subscription plan will be marked active once confirmed by staff at the counter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleModalConfirm}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] text-white font-bold uppercase tracking-wider text-sm transition-all shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? "CREATING ACCOUNT..." : "CONFIRM PAYMENT & ACTIVATE"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
