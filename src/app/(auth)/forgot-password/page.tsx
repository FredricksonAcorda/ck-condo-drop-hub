"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PhilippinePhoneInput, GmailInput } from "@/components/ui";
import { isValidPhilippinePhone } from "@/lib/utils/phone-email";

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [emailValue, setEmailValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [submittedTarget, setSubmittedTarget] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<number>(0);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let target = "";
    if (method === "phone") {
      if (!isValidPhilippinePhone(phoneValue)) {
        triggerError("Please enter a valid Philippine mobile number (+63 9XX XXX XXXX).");
        return;
      }
      target = phoneValue.trim();
    } else {
      if (!emailValue.trim() || !emailValue.includes("@")) {
        triggerError("Please enter your Gmail username.");
        return;
      }
      target = emailValue.trim();
    }

    setIsLoading(true);
    setSubmittedTarget(target);

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

      {/* Error Alert Banner - Text only, auto-dismisses after 7s with visual countdown, no dismiss button */}
      {errorMessage && (
        <div
          role="alert"
          key={errorKey}
          className="relative mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs text-center leading-relaxed overflow-hidden animate-in fade-in"
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

      {submitted ? (
        <div className="bg-[#1c1c21] border border-green-900/50 rounded-2xl p-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-green-950 text-green-400 flex items-center justify-center mx-auto text-xl">
            ✓
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Recovery Link Dispatched</h3>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
              If <strong className="text-white">{submittedTarget}</strong> is registered to a condo unit, you will receive password reset instructions via SMS or email shortly.
            </p>
          </div>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="w-full py-3 rounded-xl bg-brand-red hover:bg-[#b30000] text-white font-bold text-xs uppercase tracking-wider block text-center transition-all shadow-md"
            >
              Return to Login
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
          <div className="space-y-2">
            <div className="flex gap-1 bg-[#18181b] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  method === "email" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Email (@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  method === "phone" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Mobile (+63)
              </button>
            </div>

            {method === "email" ? (
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
