"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useParcels } from "@/context";
import { Parcel } from "@/types";

function TrackParcelContent() {
  const searchParams = useSearchParams();
  const initialNum = searchParams.get("num") || "SPX-PH-2026-8921";

  const { getParcelByTracking } = useParcels();
  const [trackQuery, setTrackQuery] = useState(initialNum);
  const [trackResult, setTrackResult] = useState<Parcel | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClaimParcel, setSelectedClaimParcel] = useState<Parcel | null>(null);

  const executeLookup = useCallback(
    async (trackingNumber: string) => {
      if (!trackingNumber.trim()) return;
      setIsSearching(true);
      setHasSearched(true);
      try {
        const match = await getParcelByTracking(trackingNumber.trim());
        setTrackResult(match);
      } finally {
        setIsSearching(false);
      }
    },
    [getParcelByTracking]
  );

  useEffect(() => {
    if (initialNum) {
      executeLookup(initialNum);
    }
  }, [initialNum, executeLookup]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLookup(trackQuery);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-brand-red text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Station 1 Live Parcel Tracker
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl mt-2 mb-2 tracking-wide uppercase">
            TRACK YOUR <span className="text-brand-red">PARCEL</span>
          </h1>
          <p className="text-white/80 text-sm leading-relaxed">
            Enter your courier tracking number to check whether your delivery has arrived and been sorted at Station 1 Front Desk.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            placeholder="Enter courier tracking number (e.g. SPX-PH-2026-8921)..."
            className="input text-base font-mono uppercase flex-1"
            required
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="btn btn-primary sm:w-44 py-3 font-bold uppercase cursor-pointer flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>{isSearching ? "Searching..." : "Track Parcel"}</span>
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-semibold text-gray-900">Try Sample Numbers:</span>
          {[
            { label: "SPX-PH-2026-8921 (Ready)", num: "SPX-PH-2026-8921" },
            { label: "JT-PH-9920148 (Ready)", num: "JT-PH-9920148" },
            { label: "FL-2026-58190 (Overdue)", num: "FL-2026-58190" },
            { label: "SPX-PH-2026-7734 (Claimed)", num: "SPX-PH-2026-7734" },
          ].map((sample) => (
            <button
              key={sample.num}
              type="button"
              onClick={() => {
                setTrackQuery(sample.num);
                executeLookup(sample.num);
              }}
              className="text-brand-red font-mono font-semibold hover:underline bg-gray-50 px-2.5 py-1 rounded border border-gray-200 cursor-pointer"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {trackResult ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg animate-in fade-in">
          {/* Result Card Header */}
          <div className="bg-gray-950 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">
                {trackResult.courier}
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black tracking-wide text-white">
                {trackResult.trackingNumber}
              </div>
            </div>

            <span
              className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase self-start sm:self-auto flex items-center gap-1.5 ${
                trackResult.status === "PICKED_UP"
                  ? "bg-blue-600"
                  : trackResult.status === "OVERDUE"
                  ? "bg-brand-red"
                  : "bg-[#107C41]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {trackResult.status === "PICKED_UP"
                ? "CLAIMED / RELEASED"
                : trackResult.status === "OVERDUE"
                ? "READY (OVERDUE)"
                : "READY FOR PICKUP"}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 uppercase font-bold text-[10px]">
                  Storage Shelf Location
                </span>
                <div className="font-bold text-sm text-gray-900">{trackResult.shelf}</div>
                <div className="text-gray-500">Station 1 Front Desk</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 uppercase font-bold text-[10px]">
                  Holding Status & Fee
                </span>
                <div className="font-bold text-sm text-gray-900">
                  {trackResult.status === "PICKED_UP" ? "Completed" : `Deadline: ${trackResult.deadline}`}
                </div>
                <div
                  className={`font-semibold ${
                    trackResult.status === "OVERDUE" ? "text-brand-red" : "text-green-700"
                  }`}
                >
                  {trackResult.holdingFee}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 uppercase font-bold text-[10px]">
                  Recipient Unit
                </span>
                <div className="font-bold text-sm text-gray-900">{trackResult.unit}</div>
                <div className="text-gray-500">{trackResult.residentName}</div>
              </div>
            </div>

            {/* Checkpoint Stepper Timeline */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                PACKAGE TIMELINE & CHECKPOINTS
              </h4>
              <div className="space-y-4 border-l-2 border-brand-red ml-3 pl-4 text-xs">
                <div className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-brand-red border-2 border-white" />
                  <span className="font-bold text-gray-900 block">
                    Arrived & Checked In at CK Drop Hub
                  </span>
                  <span className="text-gray-500">{trackResult.dateArrived}</span>
                  <p className="text-gray-500 mt-0.5">
                    Logged into shelf slot {trackResult.shelf} for recipient unit {trackResult.unit}.
                  </p>
                </div>

                {trackResult.status === "PICKED_UP" ? (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                    <span className="font-bold text-gray-900 block">
                      Picked Up & Released
                    </span>
                    <span className="text-gray-500">
                      {trackResult.claimedAt || "Released at Front Desk"}
                    </span>
                    <p className="text-gray-500 mt-0.5">
                      Claimed by {trackResult.claimedBy || "Resident"}.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-white" />
                    <span className="font-semibold text-gray-700 block">
                      Awaiting Resident Pickup
                    </span>
                    <span className="text-gray-500">
                      Passcode: <strong className="font-mono text-brand-red">{trackResult.claimCode}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Code Action Banner */}
            {trackResult.status !== "PICKED_UP" && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold block">
                    Front Desk Verification Passcode
                  </span>
                  <span className="font-mono font-black text-2xl text-brand-red tracking-wider">
                    {trackResult.claimCode}
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedClaimParcel(trackResult)}
                    className="btn btn-primary btn-sm w-full sm:w-auto font-bold uppercase cursor-pointer"
                  >
                    Show Claim QR
                  </button>
                  <Link
                    href="/parcels"
                    className="btn btn-outline btn-sm w-full sm:w-auto font-bold uppercase"
                  >
                    My Parcels
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3 shadow-md animate-in fade-in">
          <h3 className="font-bold text-base text-gray-900">Package Not Yet Arrived at Drop Hub</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            No record found for tracking number <span className="font-mono font-bold text-gray-900">&quot;{trackQuery}&quot;</span>. Your delivery rider may still be on the way to the condo lobby.
          </p>
          <div className="pt-2">
            <Link
              href="/parcels"
              className="btn btn-outline btn-sm font-bold uppercase"
            >
              View My Ready Parcels
            </Link>
          </div>
        </div>
      ) : null}

      {/* Claim Code & QR Modal Popup */}
      {selectedClaimParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                PARCEL CLAIM PASS
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Show this verification code to the receptionist at Station 1
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-brand-red/40">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                YOUR UNIQUE PASSCODE
              </div>
              <div className="font-mono text-3xl font-black text-brand-red tracking-widest my-1">
                {selectedClaimParcel.claimCode}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Tracking: {selectedClaimParcel.trackingNumber}
              </div>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl inline-block shadow-inner">
              <div className="w-36 h-36 bg-gray-50 flex flex-col items-center justify-center rounded border border-gray-200">
                <svg className="w-28 h-28 text-gray-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="10" y="10" width="24" height="24" rx="2" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" />
                  <rect x="66" y="10" width="24" height="24" rx="2" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" />
                  <rect x="10" y="66" width="24" height="24" rx="2" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" />
                  <rect x="42" y="10" width="12" height="12" />
                  <rect x="42" y="30" width="12" height="12" />
                  <rect x="42" y="50" width="12" height="12" />
                  <rect x="66" y="42" width="12" height="12" />
                  <rect x="66" y="66" width="12" height="12" />
                  <rect x="80" y="80" width="10" height="10" />
                  <rect x="50" y="76" width="10" height="14" />
                </svg>
                <span className="text-[9px] text-gray-400 mt-1 uppercase font-semibold">
                  SCAN STATION 1
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-600">
              Shelf Location: <strong>{selectedClaimParcel.shelf}</strong>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Print Pass
              </button>
              <button
                type="button"
                onClick={() => setSelectedClaimParcel(null)}
                className="btn btn-primary btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackParcelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading tracking tool...</div>}>
      <TrackParcelContent />
    </Suspense>
  );
}
