"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  // Membership & Payment State
  const [plan, setPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">("PREMIUM");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_COUNTER" | "GCASH">("CASH_COUNTER");
  const [gcashRef, setGcashRef] = useState("");

  // Password & Security
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setErrorMessage("Please complete all required resident fields (Building #, Floor #, Unit #).");
      return;
    }

    if (!isValidPhilippinePhone(phone)) {
      setErrorMessage("Please enter a valid Philippine mobile number (+63 9XX XXX XXXX).");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address (@gmail.com).");
      return;
    }

    if (!isPasswordStrongEnough(password)) {
      setErrorMessage("Please ensure your password satisfies all 5 security complexity requirements below.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the condominium parcel holding terms to proceed.");
      return;
    }

    // Direct account creation without blocking popups
    if (plan === "PER_PARCEL") {
      await executeRegistration("ACTIVE", "CASH_COUNTER", undefined);
    } else {
      if (paymentMethod === "GCASH" && gcashRef.trim()) {
        await executeRegistration("PENDING_VERIFICATION", "GCASH", gcashRef.trim());
      } else {
        await executeRegistration("PENDING_PAYMENT", paymentMethod, undefined);
      }
    }
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

      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl bg-[#141416] rounded-3xl border border-white/[0.08] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden my-4">
      {/* Top Red Glow Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-16 bg-brand-red/20 blur-xl rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <Image
            src="/brand/logo-white.png"
            alt="CK Condo Drop Hub"
            width={240}
            height={68}
            unoptimized
            priority
            className="h-9 sm:h-10 w-auto mx-auto object-contain select-none"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed max-w-md mx-auto">
          Register your unit for 24/7 secure parcel holding & instant SMS arrival alerts
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Registration Form - Responsive 2-Column Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Resident Profile & Password */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
              <span className="w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-black flex items-center justify-center">
                1
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Resident & Unit Profile
              </h2>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Full Name <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="e.g. Juan Dela Cruz"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            {/* Mobile Number & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Condominium Branch <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors cursor-pointer appearance-none"
                  disabled={isLoading}
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b} className="bg-[#1c1c21] text-white">
                      {b}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 3-Part Unit Details (Building, Floor, Unit) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
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
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
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
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Secure Password Creation */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
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

          {/* RIGHT COLUMN: Membership Plan, Payment Preference & Actions */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
              <span className="w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-black flex items-center justify-center">
                2
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Choose Membership Plan
              </h2>
            </div>

            {/* Plan Cards Stack */}
            <div className="space-y-2">
              {[
                {
                  id: "PER_PARCEL" as const,
                  name: "Per Parcel Plan",
                  price: "₱15",
                  cycle: "/ claim",
                  badge: "Free Initial",
                  badgeColor: "bg-zinc-700 text-zinc-300",
                  desc: "₱0 monthly fee. Pay only ₱15 when receiving packages at the lobby desk.",
                },
                {
                  id: "REGULAR" as const,
                  name: "Regular Plan",
                  price: "₱149",
                  cycle: "/ month",
                  badge: "15 Days Unlimited",
                  badgeColor: "bg-blue-600/30 text-blue-300 border border-blue-500/40",
                  desc: "Unlimited package intake, 3 days free holding, priority SMS alert dispatch.",
                },
                {
                  id: "PREMIUM" as const,
                  name: "Premium VIP",
                  price: "₱299",
                  cycle: "/ month",
                  badge: "Best Value",
                  badgeColor: "bg-brand-red text-white font-black",
                  desc: "7 days free holding, priority shelf slot, plus 1 free door delivery credit.",
                },
              ].map((tier) => {
                const isSelected = plan === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setPlan(tier.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none relative ${
                      isSelected
                        ? "border-brand-red bg-red-950/30 ring-1 ring-brand-red shadow-sm"
                        : "border-zinc-800 bg-[#18181c] hover:border-zinc-700 hover:bg-[#1f1f25]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-brand-red bg-brand-red" : "border-zinc-600"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs font-bold text-white">{tier.name}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1 pl-6">
                      <span className="text-base font-black text-white">{tier.price}</span>
                      <span className="text-[11px] text-zinc-400">{tier.cycle}</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-1 pl-6 leading-tight">
                      {tier.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Payment Preference (shown when Regular or Premium is selected) */}
            {plan !== "PER_PARCEL" ? (
              <div className="bg-[#18181c] border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Payment Preference</span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Settle Anytime
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH_COUNTER")}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "CASH_COUNTER"
                        ? "bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500"
                        : "bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>💵</span>
                    <span>Cash at Counter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("GCASH")}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "GCASH"
                        ? "bg-[#005CEE]/20 border-[#005CEE] text-white ring-1 ring-[#005CEE]"
                        : "bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>📱</span>
                    <span>GCash QR</span>
                  </button>
                </div>

                {paymentMethod === "GCASH" && (
                  <div className="bg-black/40 rounded-lg p-2.5 border border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-zinc-300">
                      <span>GCash Account:</span>
                      <span className="font-mono font-bold text-white">0917 888 9999</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Optional reference number (if already paid)"
                      value={gcashRef}
                      onChange={(e) => setGcashRef(e.target.value)}
                      className="w-full bg-[#1c1c21] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red"
                    />
                  </div>
                )}

                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  💡 No immediate payment required. Your account is created instantly, and your {plan === "PREMIUM" ? "Premium" : "Regular"} plan will be confirmed by lobby staff once settled.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 flex items-center gap-2">
                <span>✓</span>
                <span>Free Initial Signup. No pending payment will show on your account.</span>
              </div>
            )}

            {/* Terms agreement checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-zinc-400 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-brand-red focus:ring-brand-red w-4 h-4 cursor-pointer"
                required
                disabled={isLoading}
              />
              <span className="leading-tight">
                I agree to the Condominium Parcel Holding Policy and SMS notifications.
              </span>
            </label>

            {/* Submit Red Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating your account...</span>
                </>
              ) : (
                <span>Create Resident Account</span>
              )}
            </button>

            {/* Centered Sign In Link */}
            <div className="text-center pt-1">
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
          </div>
        </div>
      </form>
    </div>
  );
}
