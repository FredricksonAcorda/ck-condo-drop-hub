"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim()) {
      setErrorMessage("Please enter your registered email address or mobile number.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-[430px] sm:max-w-[440px] bg-[#141416] rounded-3xl border border-white/[0.08] p-7 sm:p-9 shadow-2xl overflow-hidden my-4">
      {/* Top Red Glow Rim Light */}
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
          Reset Password
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
          Enter your registered email or mobile number to receive a secure recovery code
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

      {submitted ? (
        <div className="bg-[#1c1c21] border border-green-900/50 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-green-950 text-green-400 flex items-center justify-center mx-auto text-xl">
            ✓
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Recovery Link Dispatched</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
              If <strong className="text-white">{emailOrPhone}</strong> is registered to a condo unit, you will receive password reset instructions via SMS or email shortly.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-brand-red hover:bg-[#b30000] text-white font-bold text-xs uppercase tracking-wider block text-center transition-all shadow-md"
            >
              Return to Login →
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Try another email or phone number
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="emailOrPhone"
              autoComplete="username"
              placeholder="Email address or Mobile number"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-[#1c1c21] border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/40 transition-colors"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-brand-red hover:bg-[#b30000] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-brand-red/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <span>Sending recovery code...</span>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>
      )}

      {/* Back to Login Link */}
      <div className="text-center mt-5">
        <span className="text-xs text-zinc-400">Remembered your password? </span>
        <Link href="/login" className="text-xs text-brand-red hover:underline font-semibold">
          Sign in
        </Link>
      </div>
    </div>
  );
}
