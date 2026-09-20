"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useParcels } from "@/context";
import { Parcel } from "@/types";

function TrackParcelContent() {
  const searchParams = useSearchParams();
  const { getParcelByTracking } = useParcels();
  const initialNum = searchParams.get("num") || "SPX-PH-2026-8921";

  const [query, setQuery] = useState(initialNum);
  const [result, setResult] = useState<Parcel | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const executeLookup = useCallback(async (trackingNumber: string) => {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const match = await getParcelByTracking(trackingNumber.trim());
      setResult(match);
    } finally {
      setLoading(false);
    }
  }, [getParcelByTracking]);

  // Initial lookup on mount
  useEffect(() => {
    if (initialNum) {
      executeLookup(initialNum);
    }
  }, [initialNum, executeLookup]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(query);
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
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="btn btn-primary sm:w-44 py-3 font-bold uppercase">
            {loading ? "SEARCHING..." : "TRACK PARCEL 🔍"}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-brand-border text-xs text-brand-text-secondary">
          <span>Try Sample Numbers:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("SPX-PH-2026-8921");
              executeLookup("SPX-PH-2026-8921");
            }}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            SPX-PH-2026-8921
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setQuery("JT-PH-9920148");
              executeLookup("JT-PH-9920148");
            }}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            JT-PH-9920148
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setQuery("FL-2026-58190");
              executeLookup("FL-2026-58190");
            }}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            FL-2026-58190
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              setQuery("SPX-PH-2026-7734");
              executeLookup("SPX-PH-2026-7734");
            }}
            className="text-brand-red font-mono font-semibold hover:underline"
          >
            SPX-PH-2026-7734 (Claimed)
          </button>
        </div>
      </div>

      {/* Tracking Result Card */}
      {result ? (
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-lg animate-in fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand-black to-brand-dark text-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">
                {result.courier}
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black tracking-wide text-white">
                {result.trackingNumber}
              </div>
            </div>

            <span
              className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase self-start sm:self-auto flex items-center gap-1.5 ${
                result.status === "PICKED_UP"
                  ? "bg-blue-600"
                  : result.status === "OVERDUE"
                  ? "bg-brand-red"
                  : "bg-[#107C41]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {result.status === "PICKED_UP"
                ? "CLAIMED / RELEASED"
                : result.status === "OVERDUE"
                ? "READY (OVERDUE)"
                : "READY FOR PICKUP"}
            </span>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                  Storage Slot / Status
                </span>
                <div className="font-bold text-sm text-brand-black">{result.shelf}</div>
                <div className="text-brand-text-secondary">CK Condo Drop Hub • Station 1 Front Desk</div>
              </div>

              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
                <span className="text-brand-text-muted uppercase font-bold text-[10px]">
                  Holding Status & Fee
                </span>
                <div className="font-bold text-sm text-brand-black">
                  {result.status === "PICKED_UP" ? "Completed" : `Deadline: ${result.deadline}`}
                </div>
                <div
                  className={`font-semibold ${
                    result.status === "OVERDUE" ? "text-brand-red" : "text-green-700"
                  }`}
                >
                  {result.holdingFee}
                </div>
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
                    Logged into slot {result.shelf} for recipient unit {result.unit}.
                  </p>
                </div>

                {result.status === "PICKED_UP" ? (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                    <span className="font-bold text-brand-black block">
                      Picked Up & Released
                    </span>
                    <span className="text-brand-text-secondary">
                      {result.claimedAt || "Released at Front Desk"}
                    </span>
                    <p className="text-brand-text-muted mt-0.5">
                      Claimed by {result.claimedBy || "Resident"}.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-white" />
                    <span className="font-semibold text-brand-text-secondary block">
                      Awaiting Resident Pickup / Release
                    </span>
                    <span className="text-brand-text-muted">
                      Show claim code at the front desk to retrieve package.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Claim CTA */}
            <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-brand-text-secondary">
                Are you the recipient? View your claim passcode in your resident portal.
              </div>
              <Link href="/parcels" className="btn btn-primary btn-sm whitespace-nowrap font-bold uppercase">
                GO TO MY PARCELS →
              </Link>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="bg-white rounded-2xl border border-brand-border p-8 text-center space-y-3 shadow-md">
          <div className="text-4xl">🚚</div>
          <h3 className="font-bold text-base text-brand-black">Package Not Yet Arrived at Drop Hub</h3>
          <p className="text-xs text-brand-text-secondary max-w-md mx-auto">
            No record found for tracking number <span className="font-mono font-bold text-brand-black">&quot;{query}&quot;</span> in the condominium hub storage. Your rider may still be in transit.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn btn-outline btn-sm">
              Return to Homepage
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TrackParcelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-secondary">Loading parcel tracking...</div>}>
      <TrackParcelContent />
    </Suspense>
  );
}
