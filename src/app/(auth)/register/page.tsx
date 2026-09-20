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
  const [tower, setTower] = useState("Tower A");
  const [plan, setPlan] = useState("PREMIUM");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/parcels");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl text-brand-black uppercase">
          RESIDENT <span className="text-brand-red">REGISTRATION</span>
        </h1>
        <p className="text-xs text-brand-text-secondary mt-1">
          Register your condominium unit to receive parcels safely at CK Condo Drop Hub.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-brand-text mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Juan Dela Cruz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-text mb-1">
              Mobile Number (For SMS)
            </label>
            <input
              type="tel"
              placeholder="0917 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-text mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-brand-text mb-1">
              Unit Number
            </label>
            <input
              type="text"
              placeholder="Unit 101"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-brand-text mb-1">
              Tower / Cluster
            </label>
            <select
              value={tower}
              onChange={(e) => setTower(e.target.value)}
              className="input"
            >
              <option>Tower A</option>
              <option>Tower B</option>
              <option>Tower C</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-brand-text mb-1">
            Select Drop Hub Plan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "PER_PARCEL", label: "Per Parcel", price: "₱15/drop" },
              { id: "REGULAR", label: "Regular", price: "₱149/mo" },
              { id: "PREMIUM", label: "Premium", price: "₱299/mo" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  plan === p.id
                    ? "border-brand-red bg-brand-red-light/40 text-brand-red font-bold"
                    : "border-brand-border bg-white text-brand-text hover:bg-brand-surface"
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] text-brand-text-secondary">{p.price}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-brand-text mb-1">
            Create Password
          </label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />
        </div>

        <div className="flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded border-brand-border text-brand-red focus:ring-brand-red"
            required
          />
          <span className="text-brand-text-secondary">
            I agree to the Condominium Parcel Holding Policy and SMS notification terms.
          </span>
        </div>

        <button type="submit" className="btn btn-primary w-full py-3">
          CREATE ACCOUNT & GET RESIDENT CODE →
        </button>
      </form>

      <div className="text-center text-xs text-brand-text-secondary">
        Already have a resident account?{" "}
        <Link href="/login" className="text-brand-red font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
}
