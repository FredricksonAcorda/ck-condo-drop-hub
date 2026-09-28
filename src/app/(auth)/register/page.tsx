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
  const [gcashRef, setGcashRef] = useState("");

  // Password & Security
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-dismiss error banner after 7 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

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
      setErrorMessage("Please ensure your password satisfies all 5 security complexity requirements.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the condominium parcel holding terms to proceed.");
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
    if (modalMethod === "GCASH") {
      if (gcashRef.trim()) {
        await executeRegistration("PENDING_VERIFICATION", "GCASH", gcashRef.trim());
      } else {
        await executeRegistration("PENDING_PAYMENT", "GCASH", undefined);
      }
    } else {
      await executeRegistration("PENDING_PAYMENT", "CASH_COUNTER", undefined);
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

      setShowPaymentModal(false);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account. Please try again.";
      setErrorMessage(msg);
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

      {/* Error Alert Banner - Text only, auto-dismisses after 7s, no dismiss button */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-3 p-2.5 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs text-center leading-relaxed animate-in fade-in"
        >
          {errorMessage}
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
                placeholder="e.g. Juan Dela Cruz"
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

          {/* RIGHT COLUMN: Membership Plan Selection & Actions */}
          <div className="lg:col-span-5 space-y-3">
            <div className="border-b border-zinc-800/80 pb-1.5">
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
                  badgeColor: "bg-brand-red text-white font-bold",
                  desc: "7 days free holding, priority shelf slot, plus 1 free door delivery credit.",
                },
              ].map((tier) => {
                const isSelected = plan === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setPlan(tier.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none relative ${
                      isSelected
                        ? "border-brand-red bg-red-950/30 ring-1 ring-brand-red shadow-sm"
                        : "border-zinc-800 bg-[#18181c] hover:border-zinc-700 hover:bg-[#1f1f25]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
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

                    <div className="flex items-baseline gap-1 mt-0.5 pl-5.5">
                      <span className="text-sm sm:text-base font-black text-white">{tier.price}</span>
                      <span className="text-[10.5px] text-zinc-400">{tier.cycle}</span>
                    </div>

                    <p className="text-[10.5px] text-zinc-400 mt-0.5 pl-5.5 leading-tight">
                      {tier.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Plan Note */}
            <p className="text-[11px] text-zinc-400 leading-tight">
              {plan === "PER_PARCEL"
                ? "Free initial registration. No payment required today."
                : "Payment activation will pop up next. Settle via GCash QR or Cash at Counter."}
            </p>

            {/* Terms agreement checkbox */}
            <label className="flex items-start gap-2 text-xs text-zinc-400 cursor-pointer select-none pt-0.5">
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

            {/* Submit Red Button - Text only, strictly no icons paired with text */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center cursor-pointer disabled:opacity-75"
            >
              {isLoading ? "Creating your account..." : "Create Resident Account"}
            </button>

            {/* Centered Sign In Link */}
            <div className="text-center pt-0.5">
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
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed mt-2">
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

            {/* Relocated Copyright - Inside the box below terms */}
            <p className="text-[10px] sm:text-[10.5px] text-zinc-600 text-center mt-1.5 font-medium">
              © 2026 CK Condo Drop Hub • Buildersville Condominium Community Platform
            </p>
          </div>
        </div>
      </form>

      {/* Payment Activation Modal Popup */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#16161a] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="text-center border-b border-zinc-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Membership Payment Activation
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {plan === "PREMIUM" ? "Premium VIP Plan — ₱299 / month" : "Regular Plan — ₱149 / month"}
              </p>
            </div>

            {/* Payment Method Switcher Tabs - strictly no icons paired with text */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#1f1f25] p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setModalMethod("GCASH")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  modalMethod === "GCASH"
                    ? "bg-[#005CEE] text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                GCash QR Code (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setModalMethod("CASH_COUNTER")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  modalMethod === "CASH_COUNTER"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Cash at Counter
              </button>
            </div>

            {/* Modal Body: GCash View */}
            {modalMethod === "GCASH" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-[#1a1a20] p-3 rounded-xl border border-zinc-800">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-zinc-700 bg-white p-1">
                    <Image
                      src="/images/gcash-official-qr.jpg"
                      alt="GCash Official QR Code"
                      width={120}
                      height={120}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1 text-xs text-zinc-300">
                    <p className="font-bold text-white">Scan with GCash App</p>
                    <p className="text-[11px] text-zinc-400">Account: CK CONDO DROP HUB</p>
                    <p className="text-[11px] font-mono text-zinc-200">0917 888 9999</p>
                    <p className="text-[10px] text-emerald-400">Scan to pay immediately</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Reference Number (optional if paid immediately)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={gcashRef}
                    onChange={(e) => setGcashRef(e.target.value)}
                    className="w-full bg-[#1c1c21] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red"
                  />
                </div>

                <p className="text-[11px] text-zinc-400 leading-tight">
                  Your account is created immediately. Settle anytime and your membership plan will be verified by staff.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleModalConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-[#b30000] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? "Creating account..." : "Complete Registration"}
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Body: Cash at Counter View */
              <div className="space-y-3">
                <div className="bg-[#1a1a20] p-3.5 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                  <p className="font-bold text-white">Pay at Buildersville Lobby Drop Hub</p>
                  <p className="text-zinc-400 text-[11.5px] leading-relaxed">
                    Settle your {plan === "PREMIUM" ? "₱299" : "₱149"} subscription directly at the lobby counter during package claim or your next lobby visit.
                  </p>
                  <p className="text-amber-400 text-[11px] font-medium pt-1">
                    Your account is active immediately for parcel receipts.
                  </p>
                </div>

                <p className="text-[11px] text-zinc-400 leading-tight">
                  Staff admin will mark your membership plan as active once paid at the counter.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleModalConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-[#b30000] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? "Creating account..." : "Complete Registration"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
