"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-brand-black uppercase">
          RESET <span className="text-brand-red">PASSWORD</span>
        </h1>
        <p className="text-xs text-brand-text-secondary mt-1">
          Enter your registered email or phone number to receive a secure recovery code.
        </p>
      </div>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3 animate-in fade-in">
          <div className="text-3xl">📩</div>
          <h3 className="font-bold text-sm text-green-900">Recovery Instructions Sent!</h3>
          <p className="text-xs text-green-700 leading-relaxed">
            If <strong>{emailOrPhone}</strong> is associated with a registered condo unit, you will receive an SMS or email with a password reset link shortly.
          </p>
          <div className="pt-2">
            <Link href="/login" className="btn btn-primary btn-sm w-full">
              RETURN TO LOGIN
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-text mb-1">
              Registered Email or Mobile Number
            </label>
            <input
              type="text"
              placeholder="e.g. 09171234567 or email@example.com"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="input"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-3">
            SEND RESET LINK
          </button>
        </form>
      )}

      <div className="text-center text-xs text-brand-text-secondary pt-2">
        Remembered your password?{" "}
        <Link href="/login" className="text-brand-red font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
