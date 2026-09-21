"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [tower, setTower] = useState("Tower A");
  const [plan, setPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">("PREMIUM");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !phone.trim() || !email.trim() || !unit.trim()) {
      setErrorMessage("Please complete all required resident fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the condominium parcel holding terms to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        unit: unit.trim(),
        tower,
        plan,
        password,
      });

      router.push("/parcels");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to register account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrefillDemo = () => {
    setFullName("Juan Dela Cruz");
    setPhone("0917 123 4567");
    setEmail(`juan.${Date.now().toString().slice(-4)}@example.com`);
    setTower("Tower A");
    setUnit("Unit 204");
    setPlan("PREMIUM");
    setPassword("password123");
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
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="Mobile (0917 123 4567)"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
        </div>

        {/* Tower & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <select
            value={tower}
            onChange={(e) => setTower(e.target.value)}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <option value="Tower A">Tower A</option>
            <option value="Tower B">Tower B</option>
            <option value="Tower C">Tower C</option>
            <option value="Tower 1">Tower 1</option>
            <option value="Tower 2">Tower 2</option>
            <option value="Tower 3">Tower 3</option>
          </select>

          <input
            type="text"
            placeholder="Unit (e.g. Unit 304)"
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
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

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
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

      {/* Link to Login */}
      <div className="text-center space-y-1 mt-4">
        <span className="text-xs text-zinc-400">Already have an account? </span>
        <Link href="/login" className="text-xs text-brand-red hover:underline font-semibold">
          Sign in
        </Link>
      </div>

      {/* Or Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#141416] px-3 text-zinc-500 font-medium">or</span>
        </div>
      </div>

      {/* Quick Demo Autofill Button */}
      <button
        type="button"
        onClick={handlePrefillDemo}
        className="w-full bg-[#1c1c21] hover:bg-[#24242b] border border-zinc-800 rounded-xl py-2.5 px-4 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <span>⚡</span>
        <span>Prefill Sample Resident Details</span>
      </button>

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
    </div>
  );
}
