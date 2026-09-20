"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@/context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const isInitialStaff =
    searchParams.get("portal") === "staff" || searchParams.get("role") === "admin";

  const [role, setRole] = useState<"resident" | "admin">(
    isInitialStaff ? "admin" : "resident"
  );
  const [emailOrPhone, setEmailOrPhone] = useState(
    isInitialStaff ? "admin@ckcondohub.com" : "juan.delacruz@example.com"
  );
  const [password, setPassword] = useState(
    isInitialStaff ? "adminpassword" : "password123"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMessage("Please enter both your email/phone and password.");
      return;
    }

    setIsLoading(true);

    try {
      const authUser = await login({
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
        role,
      });

      if (authUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/parcels");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (newRole: "resident" | "admin") => {
    setRole(newRole);
    setErrorMessage(null);
    if (newRole === "resident") {
      setEmailOrPhone("juan.delacruz@example.com");
      setPassword("password123");
    } else {
      setEmailOrPhone("admin@ckcondohub.com");
      setPassword("adminpassword");
    }
  };

  const triggerDemoError = () => {
    setErrorMessage("Invalid credentials. Please check your email and password, or contact the front desk.");
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher Tabs */}
      <div className="flex bg-brand-surface p-1 rounded-2xl border border-brand-border/80">
        <button
          type="button"
          onClick={() => handleSelectRole("resident")}
          className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
            role === "resident"
              ? "bg-brand-red text-white shadow-xs"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-white/60"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Resident Portal</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectRole("admin")}
          className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
            role === "admin"
              ? "bg-brand-black text-white shadow-xs"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-white/60"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Staff Station</span>
        </button>
      </div>

      {/* Heading & Subtitle */}
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black tracking-wide uppercase">
          {role === "resident" ? (
            <>
              RESIDENT <span className="text-brand-red">PORTAL</span>
            </>
          ) : (
            <>
              STAFF <span className="text-brand-red">STATION</span>
            </>
          )}
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary mt-1.5 leading-relaxed max-w-sm mx-auto font-medium">
          {role === "resident"
            ? "Access your incoming condo parcels, notifications, and claim QR codes."
            : "Authorized front desk station access for intake barcode scanning & parcel release."}
        </p>

        {role === "admin" && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-surface border border-brand-border text-[11px] font-bold text-brand-text">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>C1 Station Terminal Ready</span>
          </div>
        )}
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Curved Box: Email/Phone */}
        <div className="rounded-2xl border border-brand-border/90 bg-brand-surface/40 p-4 transition-all focus-within:border-brand-red/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-red/10 focus-within:shadow-xs">
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-2">
            {role === "resident" ? "Email or Mobile Number" : "Staff Email Address"}
          </label>
          <div className="relative">
            <input
              type="text"
              name="emailOrPhone"
              autoComplete="username"
              inputMode={role === "resident" ? "text" : "email"}
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={
                role === "resident"
                  ? "0917 123 4567 or email@domain.com"
                  : "admin@ckcondohub.com"
              }
              className="input w-full pr-10 bg-white"
              required
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-brand-text-secondary">
              {role === "resident" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              )}
            </div>
          </div>
        </div>

        {/* Curved Box: Password */}
        <div className="rounded-2xl border border-brand-border/90 bg-brand-surface/40 p-4 transition-all focus-within:border-brand-red/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-red/10 focus-within:shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-brand-red font-bold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              className="input w-full pr-10 bg-white"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-text-secondary hover:text-brand-black transition-colors cursor-pointer"
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

        <div className="flex items-center justify-between text-xs px-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-brand-border text-brand-red focus:ring-brand-red w-4 h-4"
              disabled={isLoading}
            />
            <span className="text-brand-text-secondary font-medium">Keep me signed in</span>
          </label>
        </div>

        {/* Standard UI button width (centered & reduced from full width) */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`btn w-auto min-w-[240px] sm:min-w-[280px] max-w-xs px-8 py-3.5 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              role === "resident"
                ? "btn-primary hover:shadow-md"
                : "bg-brand-black text-white hover:bg-neutral-800"
            } ${isLoading ? "opacity-80 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>
                {role === "resident" ? "SIGN IN TO RESIDENT PORTAL →" : "SIGN IN AS ADMIN →"}
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Demo helper badges */}
      <div className="pt-4 border-t border-brand-border/80 text-center space-y-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block">
          One-Click Demo Credentials
        </span>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() => handleSelectRole("resident")}
            className="text-[11px] bg-brand-surface hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-brand-border text-brand-text font-semibold transition-colors"
          >
            👤 Demo Resident (Unit 101)
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole("admin")}
            className="text-[11px] bg-brand-surface hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-brand-border text-brand-text font-semibold transition-colors"
          >
            🛡️ Demo Staff (Front Desk)
          </button>
          <button
            type="button"
            onClick={triggerDemoError}
            className="text-[11px] bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 font-semibold transition-colors"
          >
            ⚠️ Test Error
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-brand-text-secondary pt-1">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-brand-red font-bold hover:underline">
          Register Your Condo Unit
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-secondary">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
