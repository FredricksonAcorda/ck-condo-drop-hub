"use client";

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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black tracking-wide uppercase">
          RESET <span className="text-brand-red">PASSWORD</span>
        </h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary mt-1.5 leading-relaxed max-w-sm mx-auto font-medium">
          Enter your registered resident email or mobile number to receive a secure recovery code.
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

      {submitted ? (
        <div className="bg-green-50/80 border border-green-200 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <h3 className="font-bold text-base text-green-950">Recovery Instructions Dispatched</h3>
            <p className="text-xs text-green-800 leading-relaxed mt-1.5 max-w-xs mx-auto">
              If <strong className="font-extrabold text-green-900">{emailOrPhone}</strong> is registered to a condo unit, you will receive a password reset link via SMS or email within 1–2 minutes.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link href="/login" className="btn btn-primary w-full py-3 font-bold text-xs uppercase tracking-wider block text-center">
              RETURN TO LOGIN →
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-[11px] font-bold text-brand-text-secondary hover:text-brand-black hover:underline"
            >
              Try another email or phone number
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Curved Box: Email/Phone */}
          <div className="rounded-2xl border border-brand-border/90 bg-brand-surface/40 p-4 transition-all focus-within:border-brand-red/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-red/10 focus-within:shadow-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-text mb-2">
              Registered Email or Mobile Number
            </label>
            <input
              type="text"
              name="emailOrPhone"
              autoComplete="username"
              placeholder="e.g. 09171234567 or email@domain.com"
              value={emailOrPhone}
              onChange={(e) => {
                setEmailOrPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="input w-full bg-white"
              required
              disabled={isLoading}
            />
          </div>

          {/* Standard UI button width (centered & reduced from full width) */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-auto min-w-[240px] sm:min-w-[280px] max-w-xs px-8 py-3.5 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                isLoading ? "opacity-80 cursor-not-allowed" : "hover:shadow-md"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending recovery link...</span>
                </>
              ) : (
                <span>SEND RESET CODE →</span>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-xs text-brand-text-secondary pt-1">
        Remembered your password?{" "}
        <Link href="/login" className="text-brand-red font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
