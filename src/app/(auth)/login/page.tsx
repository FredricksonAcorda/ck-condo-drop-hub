"use client";

import Image from "next/image";
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

  const handleGoogleSignIn = async () => {
    // Authenticate demo account directly
    setIsLoading(true);
    try {
      if (role === "admin") {
        await login({ emailOrPhone: "admin@ckcondohub.com", password: "adminpassword", role: "admin" });
        router.push("/admin");
      } else {
        await login({ emailOrPhone: "juan.delacruz@example.com", password: "password123", role: "resident" });
        router.push("/parcels");
      }
    } catch (err) {
      setErrorMessage("Social authentication currently in demo mode.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-[430px] sm:max-w-[440px] bg-[#141416] rounded-3xl border border-white/[0.08] p-7 sm:p-9 shadow-2xl overflow-hidden">
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
      <div className="text-center mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed text-balance max-w-[320px] mx-auto">
          {role === "resident" ? (
            <>
              Sign in to access your packages, claim codes,<br className="hidden sm:inline" /> and delivery status
            </>
          ) : (
            <>
              Sign in to Station 1 front-desk intake<br className="hidden sm:inline" /> & parcel release terminal
            </>
          )}
        </p>
      </div>

      {/* Role Switcher Pill (Resident vs Admin) */}
      <div className="grid grid-cols-2 gap-1 bg-[#1c1c21] p-1 rounded-xl border border-white/5 my-5">
        <button
          type="button"
          onClick={() => handleSelectRole("resident")}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "resident"
              ? "bg-brand-red text-white shadow-md"
              : "text-zinc-400 hover:text-white"
            }`}
        >
          Resident Portal
        </button>
        <button
          type="button"
          onClick={() => handleSelectRole("admin")}
          className={`py-2 text-xs font-bold rounded-lg transition-all ${role === "admin"
              ? "bg-brand-red text-white shadow-md"
              : "text-zinc-400 hover:text-white"
            }`}
        >
          Staff Admin
        </button>
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
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
                ? "Email address or Mobile number"
                : "Staff email address"
            }
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
            required
            disabled={isLoading}
          />
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
            placeholder="Password"
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3.5 pr-11 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
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
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>

        {/* Red Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
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
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Links Below Button */}
      <div className="text-center space-y-2 mt-5">
        <div>
          <Link
            href="/forgot-password"
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div>
          <span className="text-xs text-zinc-400">Don&apos;t have an account? </span>
          <Link href="/register" className="text-xs text-brand-red hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </div>

      {/* Or Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#141416] px-3 text-zinc-500 font-medium">or</span>
        </div>
      </div>

      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full bg-[#1c1c21] hover:bg-[#24242b] border border-zinc-800 rounded-xl py-3 px-4 text-white text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Google</span>
      </button>

      {/* One-Click Fast Demo Credentials Pill helper */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        <span className="text-zinc-500">Quick Test:</span>
        <button
          type="button"
          onClick={() => handleSelectRole("resident")}
          className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-medium"
        >
          Juan (Unit 101)
        </button>
        <button
          type="button"
          onClick={() => handleSelectRole("admin")}
          className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-medium"
        >
          Staff Admin
        </button>
      </div>

      {/* Terms & Privacy Footer */}
      <p className="text-[11.5px] text-zinc-500 text-center leading-relaxed mt-5">
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500 text-xs">Loading portal...</div>}>
      <LoginForm />
    </Suspense>
  );
}
