"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"resident" | "admin">("resident");
  const [emailOrPhone, setEmailOrPhone] = useState("juan.delacruz@example.com");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/parcels");
    }
  };

  const handleDemoResident = () => {
    setRole("resident");
    setEmailOrPhone("juan.delacruz@example.com");
    setPassword("password123");
  };

  const handleDemoAdmin = () => {
    setRole("admin");
    setEmailOrPhone("admin@ckcondohub.com");
    setPassword("adminpassword");
  };

  return (
    <div className="space-y-6">
      {/* Role Switcher */}
      <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border">
        <button
          type="button"
          onClick={() => {
            setRole("resident");
            setEmailOrPhone("juan.delacruz@example.com");
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            role === "resident"
              ? "bg-brand-red text-white shadow"
              : "text-brand-text-secondary hover:text-brand-black"
          }`}
        >
          👤 Resident Login
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("admin");
            setEmailOrPhone("admin@ckcondohub.com");
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            role === "admin"
              ? "bg-brand-black text-white shadow"
              : "text-brand-text-secondary hover:text-brand-black"
          }`}
        >
          🔒 Staff / Admin
        </button>
      </div>

      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-brand-black uppercase">
          {role === "resident" ? "RESIDENT LOGIN" : "STAFF PORTAL LOGIN"}
        </h1>
        <p className="text-xs text-brand-text-secondary mt-1">
          {role === "resident"
            ? "Access your incoming parcels, notifications, and claim codes."
            : "Sign in to station dashboard and scan incoming parcels."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-brand-text mb-1">
            {role === "resident" ? "Email or Mobile Number" : "Staff Email"}
          </label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="input"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold uppercase text-brand-text">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-brand-red font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-brand-border text-brand-red focus:ring-brand-red"
            />
            <span className="text-brand-text-secondary">Keep me signed in</span>
          </label>
        </div>

        <button
          type="submit"
          className={`btn w-full py-3 ${
            role === "resident" ? "btn-primary" : "btn-dark !bg-brand-black text-white hover:!bg-brand-dark"
          }`}
        >
          {role === "resident" ? "SIGN IN TO RESIDENT PORTAL →" : "SIGN IN AS ADMIN →"}
        </button>
      </form>

      {/* Demo helper */}
      <div className="pt-4 border-t border-brand-border text-center space-y-2">
        <span className="text-[11px] text-brand-text-muted block">Quick Demo Logins:</span>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={handleDemoResident}
            className="text-[11px] bg-brand-surface hover:bg-brand-border px-2.5 py-1 rounded border border-brand-border text-brand-text font-medium"
          >
            Fill Demo Resident
          </button>
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="text-[11px] bg-brand-surface hover:bg-brand-border px-2.5 py-1 rounded border border-brand-border text-brand-text font-medium"
          >
            Fill Demo Staff
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-brand-text-secondary">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-brand-red font-bold hover:underline">
          Register Your Condo Unit
        </Link>
      </div>
    </div>
  );
}
