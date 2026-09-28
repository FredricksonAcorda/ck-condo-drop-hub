"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/context";
import { PhilippinePhoneInput, GmailInput } from "@/components/ui";
import { isValidPhilippinePhone } from "@/lib/utils/phone-email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const isInitialStaff =
    searchParams.get("portal") === "staff" || searchParams.get("role") === "admin";

  const [role, setRole] = useState<"resident" | "admin">(
    isInitialStaff ? "admin" : "resident"
  );
  const [residentMethod, setResidentMethod] = useState<"email" | "phone">("email");
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

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

    let identifier = "";
    if (role === "admin") {
      identifier = adminEmail.trim();
    } else {
      if (residentMethod === "phone") {
        if (!isValidPhilippinePhone(phoneValue)) {
          triggerError("Please enter a valid Philippine mobile number (+63 9XX XXX XXXX).");
          return;
        }
        identifier = phoneValue.trim();
      } else {
        if (!emailValue.trim() || !emailValue.includes("@")) {
          triggerError("Please enter your Gmail username.");
          return;
        }
        identifier = emailValue.trim();
      }
    }

    if (!identifier || !password.trim()) {
      triggerError("Please enter both your credentials and password.");
      return;
    }

    setIsLoading(true);

    try {
      const authUser = await login({
        emailOrPhone: identifier,
        password: password.trim(),
        role,
      });

      if (authUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/parcels");
      }
    } catch (err: unknown) {
      triggerError(
        err instanceof Error ? err.message : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (newRole: "resident" | "admin") => {
    setRole(newRole);
    setErrorMessage(null);
    setPassword("");
    if (newRole === "resident") {
      setEmailValue("");
      setPhoneValue("");
    } else {
      setAdminEmail("");
    }
  };

  return (
    <div className="relative w-full max-w-[460px] bg-[#141416] rounded-3xl border border-white/[0.08] p-6 sm:p-7 shadow-2xl overflow-hidden">
      {/* Top Red Glow Rim Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-52 h-16 bg-brand-red/20 blur-xl rounded-full pointer-events-none" />

      {/* Title & Subtitle (Logo removed per request since it is already in the top nav) */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome Back
        </h1>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-[320px] mx-auto">
          {role === "resident" ? (
            <>
              Sign in to access your packages, claim codes,<br className="hidden sm:inline" /> and delivery status
            </>
          ) : (
            <>
              Sign in to Lobby Staff Admin intake<br className="hidden sm:inline" /> & parcel release terminal
            </>
          )}
        </p>
      </div>

      {/* Role Switcher Pill (Resident vs Admin) */}
      <div className="grid grid-cols-2 gap-1 bg-[#1c1c21] p-1 rounded-xl border border-white/5 my-3.5">
        <button
          type="button"
          onClick={() => handleSelectRole("resident")}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            role === "resident"
              ? "bg-brand-red text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Resident Portal
        </button>
        <button
          type="button"
          onClick={() => handleSelectRole("admin")}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
            role === "admin"
              ? "bg-brand-red text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Staff Admin
        </button>
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {role === "resident" ? (
          <div className="space-y-2">
            <div className="flex gap-1 bg-[#18181b] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setResidentMethod("email")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  residentMethod === "email" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Email (@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => setResidentMethod("phone")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  residentMethod === "phone" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Mobile (+63)
              </button>
            </div>

            {residentMethod === "email" ? (
              <GmailInput
                value={emailValue}
                onChange={(full) => {
                  setEmailValue(full);
                  if (errorMessage) setErrorMessage(null);
                }}
                theme="dark"
                placeholder="username"
                required
                disabled={isLoading}
              />
            ) : (
              <PhilippinePhoneInput
                value={phoneValue}
                onChange={(fmt) => {
                  setPhoneValue(fmt);
                  if (errorMessage) setErrorMessage(null);
                }}
                theme="dark"
                placeholder="+63 9XX XXX XXXX"
                required
                disabled={isLoading}
              />
            )}
          </div>
        ) : (
          <div>
            <input
              type="email"
              name="adminEmail"
              autoComplete="email"
              value={adminEmail}
              onChange={(e) => {
                setAdminEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. admin@ckcondohub.com"
              className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 placeholder:opacity-50 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
              required
              disabled={isLoading}
            />
          </div>
        )}

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
            placeholder="Enter your password"
            className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
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

        {/* Red Submit Button - Text only, strictly no icons paired with text */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-1.5 py-2.5 sm:py-3 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center cursor-pointer disabled:opacity-75"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Links Below Button - Centered in middle */}
      <div className="text-center mt-3.5 space-y-1.5">
        <div>
          <p className="text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-brand-red hover:underline font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
        <div>
          <Link
            href="/forgot-password"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Terms & Privacy */}
      <p className="text-[11px] text-zinc-500 text-center leading-relaxed mt-3">
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
      <p className="text-[10.5px] text-zinc-600 text-center mt-2 font-medium">
        © 2026 CK Condo Drop Hub • Buildersville Condominium Community Platform
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
