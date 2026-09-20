"use client";

import Link from "next/link";
import { useState } from "react";
import { RecentParcel } from "@/types";

export default function AdminDashboardPage() {
  // Receive workflow state
  const [trackingInput, setTrackingInput] = useState("");
  const [courier, setCourier] = useState("SPX Express");
  const [recipient, setRecipient] = useState("Juan Dela Cruz (Unit 101)");
  const [shelf, setShelf] = useState("Shelf A-04");
  const [parcelSize, setParcelSize] = useState("Small");
  const [receiveSuccess, setReceiveSuccess] = useState<string | null>(null);

  // Pickup workflow state
  const [pickupCodeInput, setPickupCodeInput] = useState("CK-8921");
  const [verifiedResult, setVerifiedResult] = useState<{
    name: string;
    unit: string;
    code: string;
    tracking: string;
    courier: string;
    holdingFee: string;
    status: string;
  } | null>(null);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);

  // Recent parcels list
  const [recentParcels, setRecentParcels] = useState<RecentParcel[]>([
    {
      id: "r1",
      tracking: "SPX-PH-2026-8921",
      recipient: "Juan Dela Cruz",
      unit: "Unit 101 - Tower A",
      courier: "SPX Express",
      time: "10:45 AM",
      status: "READY",
      shelf: "Shelf A-04",
    },
    {
      id: "r2",
      tracking: "JT-PH-9920148",
      recipient: "Maria Santos",
      unit: "Unit 304 - Tower B",
      courier: "J&T Express",
      time: "09:30 AM",
      status: "READY",
      shelf: "Shelf B-12",
    },
    {
      id: "r3",
      tracking: "FL-2026-58190",
      recipient: "Robert Lim",
      unit: "Unit 512 - Tower A",
      courier: "Flash Express",
      time: "Yesterday",
      status: "OVERDUE",
      shelf: "Shelf C-01",
    },
    {
      id: "r4",
      tracking: "SPX-PH-2026-7734",
      recipient: "Angela Cruz",
      unit: "Unit 202 - Tower C",
      courier: "SPX Express",
      time: "Yesterday",
      status: "PICKED_UP",
      shelf: "Released",
    },
  ]);

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput) return;

    const newParcel: RecentParcel = {
      id: `p-${Date.now()}`,
      tracking: trackingInput,
      recipient: recipient.split(" (")[0],
      unit: recipient.split(" (")[1]?.replace(")", "") || "Unit 101",
      courier,
      time: "Just Now",
      status: "READY",
      shelf,
    };

    setRecentParcels([newParcel, ...recentParcels]);
    setReceiveSuccess(`Parcel ${trackingInput} logged to ${shelf}. SMS dispatched to resident!`);
    setTrackingInput("");
    setTimeout(() => setReceiveSuccess(null), 5000);
  };

  const handleVerifyPickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCodeInput) return;

    // Simulate verification
    setVerifiedResult({
      name: "Juan Dela Cruz",
      unit: "Unit 101 – Tower A",
      code: pickupCodeInput.toUpperCase(),
      tracking: "SPX-PH-2026-8921",
      courier: "SPX Express",
      holdingFee: "₱0.00 (Within 3-Day Free Period)",
      status: "AUTHORIZED FOR RELEASE",
    });
  };

  const handleConfirmRelease = () => {
    if (!verifiedResult) return;
    setPickupSuccess(`Parcel ${verifiedResult.tracking} successfully released to ${verifiedResult.name}!`);
    setVerifiedResult(null);
    setPickupCodeInput("");
    setTimeout(() => setPickupSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Station Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            ADMIN <span className="text-brand-red">DASHBOARD</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Real-time hub operations, inbound parcel intake, and resident release verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/scanner" className="btn btn-outline btn-sm">
            📷 Open Scanner Window
          </Link>
          <button
            onClick={() => {
              setTrackingInput("SPX-PH-" + Math.floor(100000 + Math.random() * 900000));
            }}
            className="btn btn-primary btn-sm"
          >
            + Quick Barcode Test
          </button>
        </div>
      </div>

      {/* 4 Colored KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ready for Pickup */}
        <div className="bg-white border-l-4 border-l-[#107C41] border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              READY FOR PICKUP
            </span>
            <span className="text-xl">📦</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-black mt-2">
            28
          </div>
          <span className="text-[11px] text-[#107C41] font-semibold">
            ● Active in Hub Storage
          </span>
        </div>

        {/* Card 2: Picked Up Today */}
        <div className="bg-white border-l-4 border-l-blue-600 border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              PICKED UP TODAY
            </span>
            <span className="text-xl">✅</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-black mt-2">
            45
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">
            +12% vs yesterday
          </span>
        </div>

        {/* Card 3: Overdue Parcels */}
        <div className="bg-white border-l-4 border-l-brand-red border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              OVERDUE PARCELS
            </span>
            <span className="text-xl">⚠️</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-red mt-2">
            4
          </div>
          <span className="text-[11px] text-brand-red font-semibold">
            Exceeded 3-Day Grace Period
          </span>
        </div>

        {/* Card 4: Registered Residents */}
        <div className="bg-white border-l-4 border-l-brand-dark border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              REGISTERED RESIDENTS
            </span>
            <span className="text-xl">👥</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-black mt-2">
            312
          </div>
          <span className="text-[11px] text-brand-text-secondary font-semibold">
            Across Tower A, B, C
          </span>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {receiveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span>✅ {receiveSuccess}</span>
          <button onClick={() => setReceiveSuccess(null)} className="text-green-600 font-bold">✕</button>
        </div>
      )}

      {pickupSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span>🎉 {pickupSuccess}</span>
          <button onClick={() => setPickupSuccess(null)} className="text-blue-600 font-bold">✕</button>
        </div>
      )}

      {/* Two Core Workflows: Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WORKFLOW 1: Receive / Add Parcel (RED HEADER) */}
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm flex flex-col">
          <div className="bg-brand-red text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📥</span>
              <h2 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider">
                RECEIVE / ADD NEW PARCEL
              </h2>
            </div>
            <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
              Intake Step 1
            </span>
          </div>

          <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                  Tracking Number / Barcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scan courier label or type number..."
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="input font-mono uppercase"
                    required
                  />
                  <Link
                    href="/admin/scanner"
                    className="btn btn-outline btn-sm shrink-0 flex items-center gap-1"
                    title="Open Camera Scanner"
                  >
                    📷 Scan
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="input text-xs"
                  >
                    <option>SPX Express</option>
                    <option>J&T Express</option>
                    <option>Flash Express</option>
                    <option>Lalamove</option>
                    <option>GrabExpress</option>
                    <option>Other / Unlisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Package Size
                  </label>
                  <select
                    value={parcelSize}
                    onChange={(e) => setParcelSize(e.target.value)}
                    className="input text-xs"
                  >
                    <option>Small (Pouch / Envelopes)</option>
                    <option>Medium (Shoebox size)</option>
                    <option>Large (Heavy Box)</option>
                    <option>Oversize / Bulky</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Resident Recipient
                  </label>
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="input text-xs"
                  >
                    <option>Juan Dela Cruz (Unit 101)</option>
                    <option>Maria Santos (Unit 304)</option>
                    <option>Robert Lim (Unit 512)</option>
                    <option>Angela Cruz (Unit 202)</option>
                    <option>David Tan (Unit 808)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Assign Shelf Slot
                  </label>
                  <select
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="input text-xs"
                  >
                    <option>Shelf A-01</option>
                    <option>Shelf A-04</option>
                    <option>Shelf B-12</option>
                    <option>Shelf C-01</option>
                    <option>Oversize Area (Floor)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <button type="submit" className="btn btn-primary w-full py-3">
                LOG PARCEL & SEND SMS NOTIFICATION 📲
              </button>
            </div>
          </form>
        </div>

        {/* WORKFLOW 2: Process Pickup & Verification (BLACK HEADER) */}
        <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm flex flex-col">
          <div className="bg-brand-black text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📤</span>
              <h2 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider">
                PARCEL PICKUP & VERIFICATION
              </h2>
            </div>
            <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
              Release Step 2
            </span>
          </div>

          <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <form onSubmit={handleVerifyPickup} className="space-y-3">
                <label className="block text-xs font-bold uppercase text-brand-text">
                  Enter Resident Claim Code or Tracking ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CK-8921 or tracking #..."
                    value={pickupCodeInput}
                    onChange={(e) => setPickupCodeInput(e.target.value)}
                    className="input font-mono uppercase"
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm shrink-0">
                    VERIFY CODE
                  </button>
                </div>
              </form>

              {/* Verification Result Box */}
              {verifiedResult ? (
                <div className="mt-4 p-4 rounded-xl border-2 border-green-500 bg-green-50/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase">
                      ✓ {verifiedResult.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-black">
                      Code: {verifiedResult.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-brand-text-secondary block">Resident Name:</span>
                      <strong className="text-brand-black text-sm">{verifiedResult.name}</strong>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Condo Unit:</span>
                      <strong className="text-brand-black text-sm">{verifiedResult.unit}</strong>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Package Matched:</span>
                      <span className="font-mono text-brand-black">{verifiedResult.tracking}</span>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Holding Fee Due:</span>
                      <span className="font-bold text-green-700">{verifiedResult.holdingFee}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-200">
                    <button
                      onClick={handleConfirmRelease}
                      className="btn btn-primary btn-sm w-full !bg-green-700 hover:!bg-green-800"
                    >
                      CONFIRM RELEASE TO RESIDENT ✓
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-6 rounded-xl border border-dashed border-brand-border text-center bg-brand-surface/40">
                  <div className="text-3xl mb-1">🔍</div>
                  <p className="text-xs font-semibold text-brand-text">
                    Awaiting Claim Code Input
                  </p>
                  <p className="text-[11px] text-brand-text-secondary mt-0.5">
                    Ask resident for their 6-character claim code or scan their QR badge.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-secondary">
              <span>Security Rule: Require Government or Condo ID if code is unverified.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Parcels Activity Table & Station Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Parcels Activity Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h3 className="font-[family-name:var(--font-heading)] text-lg uppercase tracking-wider text-brand-black">
                RECENT PARCELS ACTIVITY
              </h3>
            </div>
            <Link href="/admin/parcels" className="text-xs font-bold text-brand-red hover:underline">
              View All Parcels →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-brand-text-secondary uppercase border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3">Tracking</th>
                  <th className="px-4 py-3">Recipient & Unit</th>
                  <th className="px-4 py-3">Courier</th>
                  <th className="px-4 py-3">Shelf</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentParcels.map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-brand-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-black">
                      {parcel.tracking}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-text">{parcel.recipient}</div>
                      <div className="text-[10px] text-brand-text-secondary">{parcel.unit}</div>
                    </td>
                    <td className="px-4 py-3">{parcel.courier}</td>
                    <td className="px-4 py-3 font-mono text-[11px]">{parcel.shelf}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          parcel.status === "READY"
                            ? "bg-green-100 text-green-800"
                            : parcel.status === "OVERDUE"
                            ? "bg-brand-red-light text-brand-red"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {parcel.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-brand-text-secondary">
                      {parcel.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Shortcuts & Hub Health (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm space-y-4">
            <h3 className="font-[family-name:var(--font-heading)] text-lg uppercase tracking-wider text-brand-black">
              STATION DIAGNOSTICS
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">Hub Storage Capacity:</span>
                <span className="font-bold text-brand-black">68% (136/200 Slots)</span>
              </div>
              <div className="w-full bg-brand-surface rounded-full h-2">
                <div className="bg-brand-red h-2 rounded-full w-[68%]" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                <span className="text-brand-text-secondary">USB Barcode Scanner:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  ● Connected
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">SMS Gateway (Semaphore):</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  ● Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">Printer (Receipt / Label):</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  ● Ready
                </span>
              </div>
            </div>
          </div>

          <div className="bg-brand-black text-white p-5 rounded-xl space-y-3">
            <h3 className="font-[family-name:var(--font-heading)] text-lg uppercase tracking-wider">
              QUICK SHORTCUTS
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/scanner"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                📷 Scanner
              </Link>
              <Link
                href="/admin/customers"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                👥 Customers
              </Link>
              <Link
                href="/admin/reports"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                📊 Reports
              </Link>
              <Link
                href="/track"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                🔍 Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
