"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [tower, setTower] = useState("Tower 1");
  const [plan, setPlan] = useState<"PER_PARCEL" | "REGULAR" | "PREMIUM">("PREMIUM");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation checks
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

    // Simulate account generation latency
    setTimeout(() => {
      setIsLoading(false);
      router.push("/parcels");
    }, 750);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black tracking-wide uppercase">
          RESIDENT <span className="text-brand-red">REGISTRATION</span>
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary mt-1.5 leading-relaxed max-w-sm mx-auto font-medium">
          Register your condominium unit to receive parcels safely at the CK Condo Drop Hub.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs animate-in fade-in duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-red shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 text-sm font-bold leading-none shrink-0"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-1.5">
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
            className="input w-full"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-1.5">
              Mobile Number (SMS) <span className="text-brand-red">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0917 123 4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="input w-full"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-1.5">
              Email Address <span className="text-brand-red">*</span>
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="input w-full"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-1.5">
              Tower / Building <span className="text-brand-red">*</span>
            </label>
            <select
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              className="input w-full cursor-pointer"
              disabled={isLoading}
            >
              <option value="Tower 1">Tower 1</option>
              <option value="Tower 2">Tower 2</option>
              <option value="Tower 3">Tower 3</option>
              <option value="Tower A">Tower A</option>
              <option value="Tower B">Tower B</option>
              <option value="Tower C">Tower C</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-1.5">
              Unit Number <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 304"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="input w-full"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Plan Selector */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Select Membership Tier
            </label>
            <span className="text-[11px] text-brand-text-secondary font-medium">Can change anytime</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "PER_PARCEL" as const,
                label: "Per Parcel",
                price: "₱15",
                period: "per claim",
                holding: "3 Days Free",
              },
              {
                id: "REGULAR" as const,
                label: "Regular",
                price: "₱149",
                period: "per month",
                holding: "3 Days Free",
              },
              {
                id: "PREMIUM" as const,
                label: "Premium",
                price: "₱299",
                period: "per month",
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
                  className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all relative select-none cursor-pointer ${
                    isSelected
                      ? "border-brand-red bg-red-50/60 text-brand-text shadow-xs ring-1 ring-brand-red/30"
                      : "border-brand-border bg-white text-brand-text hover:bg-brand-surface"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[9px] font-black uppercase px-2 py-0.2 rounded-full tracking-wider shadow-xs">
                      Value
                    </span>
                  )}
                  <div className={`text-xs font-black uppercase tracking-tight ${isSelected ? "text-brand-red" : ""}`}>
                    {p.label}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-brand-black leading-tight mt-0.5">
                    {p.price}
                  </div>
                  <div className="text-[10px] text-brand-text-secondary font-medium">
                    {p.holding}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Create Password <span className="text-brand-red">*</span>
            </label>
            <span className="text-[11px] text-brand-text-secondary">Min. 8 characters</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="input w-full pr-10"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-text-secondary hover:text-brand-black transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs pt-1">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-brand-border text-brand-red focus:ring-brand-red w-4 h-4 shrink-0"
            required
            disabled={isLoading}
          />
          <span className="text-brand-text-secondary leading-relaxed select-none">
            I agree to the Condominium Parcel Holding Policy and consent to SMS arrival notifications.
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`btn btn-primary w-full py-3.5 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
            isLoading ? "opacity-80 cursor-not-allowed" : "hover:shadow-md"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating your resident account...</span>
            </>
          ) : (
            <span>CREATE ACCOUNT & GET RESIDENT CODE →</span>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-brand-text-secondary pt-1">
        Already have a resident account?{" "}
        <Link href="/login" className="text-brand-red font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}
