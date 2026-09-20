"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useParcels } from "@/context";
import { db } from "@/lib/db/local-store";
import { ResidentProfile, Parcel } from "@/types";
import { printThermalShelfLabel, printClaimReleaseSlip } from "@/lib/print/label-generator";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { parcels, logParcel, verifyClaimCode, releaseParcel, getParcelByTracking, hubSettings } = useParcels();

  // Residents list for intake recipient selector
  const [residents, setResidents] = useState<ResidentProfile[]>([]);

  // Receive workflow state
  const initialTracking = searchParams.get("tracking") || "";
  const initialCourier = searchParams.get("courier") || "SPX Express";

  const [trackingInput, setTrackingInput] = useState(initialTracking);
  const [courier, setCourier] = useState(initialCourier);
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [shelf, setShelf] = useState("Shelf A-04");
  const [parcelSize, setParcelSize] = useState<"Small" | "Medium" | "Large" | "Oversize">("Small");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState<string | null>(null);
  const [lastCreatedParcel, setLastCreatedParcel] = useState<Parcel | null>(null);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Pickup workflow state
  const [pickupCodeInput, setPickupCodeInput] = useState("CK-8921");
  const [verifiedParcel, setVerifiedParcel] = useState<Parcel | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState<string | null>(null);
  const [lastReleasedParcel, setLastReleasedParcel] = useState<Parcel | null>(null);

  // Fetch residents on mount
  useEffect(() => {
    async function loadResidents() {
      const res = await db.getAllResidents();
      setResidents(res);
      if (res.length > 0 && !selectedResidentId) {
        setSelectedResidentId(res[0].id);
      }
    }
    loadResidents();
  }, [selectedResidentId]);

  // Update tracking/courier if query params change (e.g. from scanner)
  useEffect(() => {
    const t = searchParams.get("tracking");
    const c = searchParams.get("courier");
    if (t) setTrackingInput(t);
    if (c) setCourier(c);
  }, [searchParams]);

  // Compute live KPIs
  const readyCount = parcels.filter((p) => p.status === "READY").length;
  const overdueCount = parcels.filter((p) => p.status === "OVERDUE").length;
  const activeInHub = readyCount + overdueCount;
  const pickedUpCount = parcels.filter((p) => p.status === "PICKED_UP").length;
  const registeredResidentsCount = residents.length;

  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiveError(null);
    setReceiveSuccess(null);

    if (!trackingInput.trim()) {
      setReceiveError("Please provide a tracking number or scan barcode.");
      return;
    }

    const resident = residents.find((r) => r.id === selectedResidentId);
    if (!resident) {
      setReceiveError("Please select a valid condo resident.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newParcel = await logParcel({
        trackingNumber: trackingInput.trim(),
        courier,
        residentId: resident.id,
        residentName: resident.name,
        unit: `${resident.unit} - ${resident.tower}`,
        shelf,
        size: parcelSize,
        notes: notes.trim() || undefined,
      });

      setLastCreatedParcel(newParcel);
      setReceiveSuccess(
        `Parcel ${newParcel.trackingNumber} successfully logged to ${newParcel.shelf}! Passcode [${newParcel.claimCode}] generated & SMS notification dispatched to ${resident.name}.`
      );
      if (hubSettings.autoPrintIntakeLabel) {
        printThermalShelfLabel({
          parcel: newParcel,
          hubName: hubSettings.hubName,
          station: hubSettings.stationName,
        });
      }
      setTrackingInput("");
      setNotes("");
    } catch (err: unknown) {
      setReceiveError(err instanceof Error ? err.message : "Failed to log parcel");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifiedParcel(null);

    const cleanInput = pickupCodeInput.trim();
    if (!cleanInput) {
      setVerifyError("Please enter a claim code or tracking number.");
      return;
    }

    // Try claim code first
    let found = await verifyClaimCode(cleanInput);
    // If not found, try tracking number
    if (!found) {
      found = await getParcelByTracking(cleanInput);
    }

    if (found) {
      if (found.status === "PICKED_UP") {
        setVerifyError(`Parcel ${found.trackingNumber} was already released to ${found.claimedBy || "resident"} at ${found.claimedAt || "earlier"}.`);
      } else {
        setVerifiedParcel(found);
      }
    } else {
      setVerifyError(`No active parcel found matching code "${cleanInput}". Please verify code with resident.`);
    }
  };

  const handleConfirmRelease = async () => {
    if (!verifiedParcel) return;
    setIsReleasing(true);
    try {
      const released = await releaseParcel(verifiedParcel.id, verifiedParcel.residentName);
      setLastReleasedParcel(released);
      setPickupSuccess(`Parcel ${released.trackingNumber} successfully released to ${released.residentName}!`);
      setVerifiedParcel(null);
      setPickupCodeInput("");
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : "Failed to release parcel");
    } finally {
      setIsReleasing(false);
    }
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

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/parcels" className="btn btn-outline btn-sm">
            📦 Inventory ({parcels.length})
          </Link>
          <Link href="/admin/scanner" className="btn btn-outline btn-sm">
            📷 Scanner Terminal
          </Link>
          <Link href="/admin/reports" className="btn btn-outline btn-sm">
            📜 SMS Logs
          </Link>
          <Link href="/admin/settings" className="btn btn-outline btn-sm">
            ⚙️ Hub Settings
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
              ACTIVE IN HUB
            </span>
            <span className="text-xl">📦</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-black mt-2">
            {activeInHub}
          </div>
          <span className="text-[11px] text-[#107C41] font-semibold">
            ● {readyCount} Ready • {overdueCount} Overdue
          </span>
        </div>

        {/* Card 2: Picked Up */}
        <div className="bg-white border-l-4 border-l-blue-600 border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
              TOTAL RELEASED
            </span>
            <span className="text-xl">✅</span>
          </div>
          <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-black mt-2">
            {pickedUpCount}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">
            Successfully claimed
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
            {overdueCount}
          </div>
          <span className="text-[11px] text-brand-red font-semibold">
            {overdueCount > 0 ? "Subject to ₱10/day holding fee" : "All within grace period"}
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
            {registeredResidentsCount}
          </div>
          <span className="text-[11px] text-brand-text-secondary font-semibold">
            Condo Units in Database
          </span>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {receiveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm animate-in fade-in">
          <span className="font-medium">✅ {receiveSuccess}</span>
          <div className="flex items-center gap-2">
            {lastCreatedParcel && (
              <button
                type="button"
                onClick={() =>
                  printThermalShelfLabel({
                    parcel: lastCreatedParcel,
                    hubName: hubSettings.hubName,
                    station: hubSettings.stationName,
                  })
                }
                className="btn btn-sm bg-green-700 hover:bg-green-800 text-white text-xs font-bold"
              >
                🏷️ Print Shelf Label
              </button>
            )}
            <button onClick={() => setReceiveSuccess(null)} className="text-green-600 font-bold ml-2">✕</button>
          </div>
        </div>
      )}

      {receiveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span className="font-medium">⚠️ {receiveError}</span>
          <button onClick={() => setReceiveError(null)} className="text-red-600 font-bold ml-3">✕</button>
        </div>
      )}

      {pickupSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm animate-in fade-in">
          <span className="font-medium">🎉 {pickupSuccess}</span>
          <div className="flex items-center gap-2">
            {lastReleasedParcel && (
              <button
                type="button"
                onClick={() =>
                  printClaimReleaseSlip({
                    parcel: lastReleasedParcel,
                    releasedByStaff: hubSettings.stationName,
                    hubName: hubSettings.hubName,
                  })
                }
                className="btn btn-sm bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold"
              >
                🧾 Print Release Slip
              </button>
            )}
            <button onClick={() => setPickupSuccess(null)} className="text-blue-600 font-bold ml-2">✕</button>
          </div>
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
                  Tracking Number / Barcode <span className="text-brand-red">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Scan courier label or type number..."
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="input font-mono uppercase w-full"
                    required
                    disabled={isSubmitting}
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
                    className="input text-xs w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="SPX Express">SPX Express</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="Flash Express">Flash Express</option>
                    <option value="LBC Express">LBC Express</option>
                    <option value="Ninja Van">Ninja Van</option>
                    <option value="Lalamove">Lalamove</option>
                    <option value="GrabExpress">GrabExpress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Package Size
                  </label>
                  <select
                    value={parcelSize}
                    onChange={(e) => setParcelSize(e.target.value as typeof parcelSize)}
                    className="input text-xs w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="Small">Small (Pouch / Envelopes)</option>
                    <option value="Medium">Medium (Shoebox size)</option>
                    <option value="Large">Large (Heavy Box)</option>
                    <option value="Oversize">Oversize / Bulky</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Resident Recipient <span className="text-brand-red">*</span>
                  </label>
                  <select
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                    className="input text-xs w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.unit} - {r.tower})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                    Assign Shelf Slot
                  </label>
                  <select
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    className="input text-xs w-full cursor-pointer"
                    disabled={isSubmitting}
                  >
                    <option value="Shelf A-01">Shelf A-01</option>
                    <option value="Shelf A-04">Shelf A-04</option>
                    <option value="Shelf B-02">Shelf B-02</option>
                    <option value="Shelf B-12">Shelf B-12</option>
                    <option value="Shelf C-01">Shelf C-01</option>
                    <option value="Oversize Area (Floor)">Oversize Area (Floor)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Logging to Inventory...</span>
                ) : (
                  <span>LOG PARCEL & SEND SMS NOTIFICATION 📲</span>
                )}
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
                    onChange={(e) => {
                      setPickupCodeInput(e.target.value);
                      if (verifyError) setVerifyError(null);
                    }}
                    className="input font-mono uppercase w-full"
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm shrink-0 font-bold uppercase">
                    VERIFY CODE
                  </button>
                </div>
              </form>

              {verifyError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {verifyError}
                </div>
              )}

              {/* Verification Result Box */}
              {verifiedParcel ? (
                <div className="mt-4 p-4 rounded-xl border-2 border-green-500 bg-green-50/50 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded uppercase">
                      ✓ AUTHORIZED FOR RELEASE
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-black">
                      Code: {verifiedParcel.claimCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-brand-text-secondary block">Resident Name:</span>
                      <strong className="text-brand-black text-sm">{verifiedParcel.residentName}</strong>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Condo Unit:</span>
                      <strong className="text-brand-black text-sm">{verifiedParcel.unit}</strong>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Package Matched:</span>
                      <span className="font-mono text-brand-black">{verifiedParcel.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Holding Status:</span>
                      <span className="font-bold text-green-700">{verifiedParcel.holdingFee}</span>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Assigned Shelf:</span>
                      <strong className="text-brand-black">{verifiedParcel.shelf}</strong>
                    </div>
                    <div>
                      <span className="text-brand-text-secondary block">Courier:</span>
                      <span className="text-brand-text font-semibold">{verifiedParcel.courier}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-green-200">
                    <button
                      onClick={handleConfirmRelease}
                      disabled={isReleasing}
                      className="btn btn-primary btn-sm w-full !bg-green-700 hover:!bg-green-800 font-bold uppercase tracking-wider"
                    >
                      {isReleasing ? "Releasing..." : "CONFIRM RELEASE TO RESIDENT ✓"}
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
            <span className="text-xs text-brand-text-secondary font-medium">
              Live database stream ({parcels.length} total)
            </span>
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
                  <th className="px-4 py-3 text-right">Claim Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {parcels.slice(0, 10).map((parcel) => (
                  <tr key={parcel.id} className="hover:bg-brand-surface/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-black">
                      {parcel.trackingNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-text">{parcel.residentName}</div>
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
                    <td className="px-4 py-3 text-right font-mono font-bold text-brand-red">
                      {parcel.claimCode}
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
                <span className="font-bold text-brand-black">
                  {Math.round((activeInHub / 200) * 100)}% ({activeInHub}/200 Slots)
                </span>
              </div>
              <div className="w-full bg-brand-surface rounded-full h-2">
                <div
                  className="bg-brand-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((activeInHub / 200) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                <span className="text-brand-text-secondary">USB Barcode Scanner:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  ● Connected
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-text-secondary">Storage Engine:</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  ● Live Browser Store (Reactive)
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
                href="/track"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                🔍 Tracking
              </Link>
              <Link
                href="/parcels"
                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-center text-xs font-bold transition-colors"
              >
                📦 Resident View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-secondary">Loading hub station...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
