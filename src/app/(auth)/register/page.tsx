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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState<string>("Malinta Branch");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [plan, setPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">("PREMIUM");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"GCASH" | "CASH_COUNTER">("GCASH");
  const [gcashRef, setGcashRef] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

    // If paid plan, prompt payment selection first
    if (plan === "REGULAR" || plan === "PREMIUM") {
      setShowPaymentModal(true);
      return;
    }

    // Free Per Parcel plan
    await executeRegistration("ACTIVE", "CASH_COUNTER", undefined);
  };

  const executeRegistration = async (
    planStatus: "ACTIVE" | "PENDING_PAYMENT" | "PENDING_VERIFICATION",
    method: "GCASH" | "CASH_COUNTER",
    reference?: string
  ) => {
    setIsLoading(true);
    setPaymentError(null);

    const fullUnitString = `Bldg ${buildingNumber.trim()} • Flr ${floorNumber.trim()} • Unit ${unitNumber.trim()}`;

    try {
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
        plan,
        pendingPlan: plan !== "PER_PARCEL" ? plan : undefined,
        planStatus,
        paymentMethod: method,
        paymentReference: reference,
        password,
      });

      if (plan !== "PER_PARCEL") {
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
          reference: reference,
          status: "PENDING",
          notes: "Pending Admin Payment Verification",
        });
      }

      setShowPaymentModal(false);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register account. Please try again.";
      if (showPaymentModal) {
        setPaymentError(msg);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentMethod === "GCASH") {
      if (!gcashRef.trim() || gcashRef.trim().length < 8) {
        setPaymentError("Please enter a valid GCash reference number (at least 8 digits).");
        return;
      }
      // Paid plan requires manual verification by admin
      await executeRegistration("PENDING_VERIFICATION", "GCASH", gcashRef.trim());
    } else {
      // Cash at counter -> plan status is PENDING_PAYMENT
      await executeRegistration("PENDING_PAYMENT", "CASH_COUNTER", undefined);
    }
  };

  return (
    <div className="relative w-full max-w-[460px] sm:max-w-[480px] bg-[#141416] rounded-3xl border border-white/[0.08] p-7 sm:p-9 shadow-2xl overflow-hidden my-4">
      {/* Top Red Glow Rim Light (matches reference styling) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-52 h-16 bg-brand-red/20 blur-xl rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-block group">
          <Image
            src="/brand/logo-white.png"
            alt="CK Condo Drop Hub"
            width={240}
            height={68}
            unoptimized
            priority
            className="h-10 sm:h-11 w-auto mx-auto object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>
        <p className="text-xs text-zinc-400 font-medium tracking-wide mt-1.5">
          Buildersville Condominium Drop Hub
        </p>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center mt-5 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed text-balance max-w-[340px] mx-auto">
          Sign up your condo unit for secure 24/7 parcel drop-off & SMS arrival alerts
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs animate-in fade-in"
        >
          <span className="text-red-400 mt-0.5">⚠️</span>
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Full Name */}
        <div>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Full Name (e.g. Juan Dela Cruz)"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        {/* Mobile Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
          <GmailInput
            value={email}
            onChange={(full) => {
              setEmail(full);
              if (errorMessage) setErrorMessage(null);
            }}
            theme="dark"
            placeholder="username"
            required
            disabled={isLoading}
          />
        </div>

        {/* Branch Selection */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 px-0.5">
            Condo Drop Hub Branch
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b} className="bg-[#1c1c21] text-white">
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* 3 Divided Unit Input Fields (Building #, Floor #, Unit #) */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 px-0.5">
            Unit Details (Building #, Floor #, Unit #)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <input
                type="text"
                placeholder="Building #"
                value={buildingNumber}
                onChange={(e) => {
                  setBuildingNumber(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
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
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
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
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors text-center"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Membership Tier Cards */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5 px-0.5">
            Select Membership Plan
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "PER_PARCEL" as const,
                label: "Per Parcel",
                price: "₱15",
                holding: "3 Days Free",
              },
              {
                id: "REGULAR" as const,
                label: "Regular",
                price: "₱149/mo",
                holding: "3 Days Free",
              },
              {
                id: "PREMIUM" as const,
                label: "Premium",
                price: "₱299/mo",
                holding: "7 Days Free",
                popular: true,
              },
            ].map((p) => {
              const isSelected = plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  disabled={isLoading}
                  className={`p-2 rounded-xl border text-center transition-all relative cursor-pointer ${
                    isSelected
                      ? "border-brand-red bg-red-950/40 text-white ring-1 ring-brand-red"
                      : "border-zinc-800 bg-[#1c1c21] text-zinc-400 hover:text-white hover:bg-[#222228]"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider">
                      Popular
                    </span>
                  )}
                  <div className={`text-[11px] font-bold ${isSelected ? "text-brand-red" : ""}`}>
                    {p.label}
                  </div>
                  <div className="text-xs font-black text-white mt-0.5">{p.price}</div>
                  <div className="text-[9px] text-zinc-400">{p.holding}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secure Password Creation with Real-Time Strength Meter & Requirements */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Password <span className="text-brand-red">*</span>
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
          className="w-full mt-3 py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
            <span>Sign Up</span>
          )}
        </button>
      </form>

      {/* Link to Login - Centered below sign up button */}
      <div className="text-center mt-5">
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

      {/* Terms & Privacy Footer */}
      <p className="text-[11px] text-zinc-500 text-center leading-relaxed mt-4">
        By signing up, you agree to our{" "}
        <Link href="#" className="text-zinc-400 underline hover:text-zinc-300">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-zinc-400 underline hover:text-zinc-300">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Payment Selection Modal for Paid Tiers (Regular / Premium) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-[460px] bg-[#141416] border border-zinc-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-left my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Top Red Glow Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1.5">
                  Payment Activation Required
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {plan === "PREMIUM" ? "Premium Plan (₱299/mo)" : "Regular Plan (₱149/mo)"}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Choose your payment method to activate your condominium parcel benefits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{paymentError}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("GCASH");
                  setPaymentError(null);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "GCASH"
                    ? "bg-[#005CEE]/20 border-[#005CEE] text-white ring-1 ring-[#005CEE]"
                    : "bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#222228]"
                }`}
              >
                <span>📱</span>
                <span>GCash QR (Instant)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CASH_COUNTER");
                  setPaymentError(null);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === "CASH_COUNTER"
                    ? "bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500"
                    : "bg-[#1c1c21] border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#222228]"
                }`}
              >
                <span>🏢</span>
                <span>Cash at Counter</span>
              </button>
            </div>

            {/* GCash Option */}
            {paymentMethod === "GCASH" && (
              <div className="space-y-4">
                <div className="bg-[#1c1c21] border border-zinc-800 rounded-2xl p-4 text-center">
                  <div className="flex items-center justify-between text-xs pb-2 mb-2 border-b border-zinc-800">
                    <span className="text-zinc-400">Account Name:</span>
                    <span className="font-bold text-white">DI**A P.</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 mb-2 border-b border-zinc-800">
                    <span className="text-zinc-400">GCash Mobile:</span>
                    <span className="font-mono font-bold text-white">+63 993 267 ••••</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-3 mb-3 border-b border-zinc-800">
                    <span className="text-zinc-400">Total Due:</span>
                    <span className="font-bold text-lg text-emerald-400">
                      ₱{plan === "PREMIUM" ? "299.00" : "149.00"}
                    </span>
                  </div>

                  {/* Official GCash QR graphic (Image itself is the card) */}
                  <div className="flex justify-center mb-2">
                    <Image
                      src="/images/gcash-official-qr.jpg"
                      alt="Official GCash QR Code"
                      width={562}
                      height={795}
                      className="w-52 sm:w-56 h-auto rounded-xl border border-zinc-700 shadow-sm object-contain"
                      priority
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Scan via GCash App, send payment, or enter your GCash mobile number below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    GCash Number (if QR can&apos;t be scanned)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your GCash Mobile Number"
                    value={gcashRef}
                    onChange={(e) => {
                      setGcashRef(e.target.value);
                      if (paymentError) setPaymentError(null);
                    }}
                    className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
                    <span>Instant activation upon verification</span>
                    <button
                      type="button"
                      onClick={() => setGcashRef("0917 123 4567")}
                      className="text-brand-red hover:underline font-medium"
                    >
                      Fill Sample Number
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? "Verifying & Registering..." : "Verify Payment & Activate Account"}
                </button>
              </div>
            )}

            {/* Cash at Counter Option */}
            {paymentMethod === "CASH_COUNTER" && (
              <div className="space-y-4">
                <div className="bg-[#1c1c21] border border-amber-800/40 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>🏢</span>
                    <span>Lobby Staff Admin Cashier</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    You can pay in cash at the Ground Floor Lobby reception counter during operational hours.
                  </p>

                  <div className="bg-[#141416] p-3 rounded-xl border border-zinc-800 text-xs space-y-1 text-zinc-300">
                    <div>📍 <strong>Location:</strong> Ground Floor Main Lobby Desk</div>
                    <div>🕒 <strong>Hours:</strong> Daily 8:00 AM – 9:00 PM</div>
                    <div>
                      💵 <strong>Amount Due:</strong>{" "}
                      <span className="text-emerald-400 font-bold">
                        ₱{plan === "PREMIUM" ? "299.00" : "149.00"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                    ℹ️ <strong>Please note:</strong> Your account will be created immediately, but your {plan === "PREMIUM" ? "Premium" : "Regular"} tier status will be set to <strong>Pending Payment</strong>. Once desk staff receives your cash payment, your tier benefits (extended free days & door credits) will be fully unlocked.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isLoading ? "Creating Account..." : "Register Account (Pay Cash at Counter)"}
                </button>
              </div>
            )}

            {/* Switch to Free Per Parcel Link */}
            <div className="pt-4 mt-4 border-t border-zinc-800 text-center">
              <button
                type="button"
                onClick={async () => {
                  setPlan("PER_PARCEL");
                  await executeRegistration("ACTIVE", "CASH_COUNTER", undefined);
                }}
                disabled={isLoading}
                className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Prefer free pay-per-parcel? Switch to Per Parcel Plan (₱15/claim, ₱0 initial)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
