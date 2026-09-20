"use client";

import Link from "next/link";
import { useState } from "react";

export default function TrackParcelPage() {
  const [query, setQuery] = useState("SPX-PH-2026-8921");
  const [result, setResult] = useState<{
    tracking: string;
    courier: string;
    recipient: string;
    unit: string;
    status: "READY" | "PICKED_UP" | "IN_TRANSIT";
    dateArrived: string;
    deadline: string;
    shelf: string;
    holdingFee: string;
  } | null>({
    tracking: "SPX-PH-2026-8921",
    courier: "SPX Express",
    recipient: "Juan Dela Cruz",
    unit: "Unit 101 – Tower A",
    status: "READY",
    dateArrived: "Sept 18, 2026 • 10:45 AM",
    deadline: "Sept 21, 2026",
    shelf: "Shelf A-04",
    holdingFee: "₱0.00 (Within 3-Day Free Holding Period)",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setResult({
      tracking: query.toUpperCase(),
      courier: query.toUpperCase().startsWith("SPX")
        ? "SPX Express"
        : query.toUpperCase().startsWith("JT")
        ? "J&T Express"
        : "Flash Express",
      recipient: "Juan Dela Cruz",
      unit: "Unit 101 – Tower A",
      status: "READY",
      dateArrived: "Today • Just Received",
      deadline: "3 Days from Today",
      shelf: "Front Desk Sorting Bin",
      holdingFee: "₱0.00 (Free)",
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-red">
          Real-Time Tracking Service
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl text-brand-black uppercase">
          TRACK YOUR <span className="text-brand-red">PARCEL</span>
        </h1>
        <p className="text-sm text-brand-text-secondary max-w-md mx-auto">
          Enter any SPX, J&T, Flash Express, or courier tracking number to check if it has arrived at the drop hub.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter tracking number (e.g. SPX-PH-2026-8921)..."
            className="input text-base font-mono uppercase flex-1"
            required
          />
          <button type="submit" className="btn btn-primary sm:w-44 py-3">
            TRACK PARCEL 🔍
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-brand-border text-xs text-brand-text-secondary">
          <span>Try Sample Numbers:</span>
          <button
            type="button"
            onClick={() => setQuery("SPX-PH-2026-8921")}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            SPX-PH-2026-8921
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setQuery("JT-PH-9920148")}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            JT-PH-9920148
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setQuery("FL-2026-58190")}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            FL-2026-58190
          </button>
        </div>
      </div>

      {/* Tracking Result Card */}
      {result && (
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-lg animate-in fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-black to-brand-dark text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">
                {result.courier}
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black tracking-wide text-white">
                {result.tracking}
              </div>
            </div>

            <span className="bg-[#107C41] text-white text-xs font-bold px-3 py-1 rounded-full uppercase self-start sm:self-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              READY FOR PICKUP
            </span>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                  Intake Location
                </span>
                <div className="font-bold text-sm text-brand-black">{result.shelf}</div>
                <div className="text-brand-text-secondary">CK Condo Drop Hub • Ground Floor Lobby</div>
              </div>

              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                  Free Holding Period
                </span>
                <div className="font-bold text-sm text-brand-black">{result.deadline}</div>
                <div className="text-green-700 font-semibold">{result.holdingFee}</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-black">
                PACKAGE TIMELINE
              </h4>
              <div className="space-y-4 border-l-2 border-brand-red ml-3 pl-4 text-xs">
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-brand-red border-2 border-white" />
                  <span className="font-bold text-brand-black block">
                    Arrived & Checked In at CK Drop Hub
                  </span>
                  <span className="text-brand-text-secondary">{result.dateArrived}</span>
                  <p className="text-brand-text-muted mt-0.5">
                    Scanned into inventory slot {result.shelf}. SMS notification dispatched.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-gray-300 border-2 border-white" />
                  <span className="font-semibold text-brand-text-secondary block">
                    Awaiting Resident Pickup / Release
                  </span>
                  <span className="text-brand-text-muted">
                    Show claim code to the receptionist on duty.
                  </span>
                </div>
              </div>
            </div>

            {/* Claim CTA */}
            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-brand-text-secondary">
                Are you the recipient? View your claim code in your portal account.
              </div>
              <Link href="/login" className="btn btn-primary btn-sm whitespace-nowrap">
                VIEW CLAIM CODE →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
