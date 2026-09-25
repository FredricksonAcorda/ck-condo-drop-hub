"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { useParcels, useAuth } from "@/context";
import { Parcel, ParcelStatus, ResidentProfile, ParcelSize } from "@/types";
import { db } from "@/lib/db/local-store";
import { detectCourierFromBarcode } from "@/lib/scanner/courier-detector";

export default function ParcelsInventoryPage() {
  const { parcels, logParcel, releaseParcel, updateParcel, deleteParcel } = useParcels();
  const { user } = useAuth();

  // Registered Residents for quick intake
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");

  // Quick Inbound Scanner Form State
  const [trackingInput, setTrackingInput] = useState("");
  const [courier, setCourier] = useState("SPX Express");
  const [parcelSize, setParcelSize] = useState<ParcelSize>("Medium");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeSuccess, setIntakeSuccess] = useState<string | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [newlyLoggedId, setNewlyLoggedId] = useState<string | null>(null);

  // Search & Status Filters (Exact UI from Live Parcel Activity Stream)
  const [searchQuery, setSearchQuery] = useState("");
  const [quickPasscodeSearch, setQuickPasscodeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ParcelStatus>("ALL");

  // Release Modal State
  const [releaseModalParcel, setReleaseModalParcel] = useState<Parcel | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState<string>("");
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);

  const trackingInputRef = useRef<HTMLInputElement | null>(null);

  // Load residents from DB
  useEffect(() => {
    async function loadResidents() {
      try {
        const list = await db.getAllResidents();
        setResidents(list);
        if (list.length > 0 && !selectedResidentId) {
          setSelectedResidentId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load residents:", err);
      }
    }
    loadResidents();
  }, [selectedResidentId]);

  // Handle tracking input and auto-detect courier
  const handleTrackingChange = (value: string) => {
    setTrackingInput(value);
    if (intakeError) setIntakeError(null);

    if (value.trim().length >= 3) {
      const detected = detectCourierFromBarcode(value.trim());
      if (detected.confidence !== "UNKNOWN") {
        setCourier(detected.name);
      }
    }
  };

  // Handle Inbound Scan Submit (NO PRINTER SETTINGS POPUP - PURE INVENTORY ADDITION)
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntakeError(null);
    setIntakeSuccess(null);

    const cleanTracking = trackingInput.trim().toUpperCase();
    if (!cleanTracking) {
      setIntakeError("Please scan or enter a courier tracking number.");
      return;
    }

    const resident = residents.find((r) => r.id === selectedResidentId);
    if (!resident) {
      setIntakeError("Please select a registered condo resident.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newParcel = await logParcel({
        trackingNumber: cleanTracking,
        courier,
        residentId: resident.id,
        residentName: resident.name,
        unit: `${resident.unit} - ${resident.tower}`,
        shelf: "Lobby Counter",
        size: parcelSize,
        notes: notes.trim() || undefined,
      });

      setNewlyLoggedId(newParcel.id);
      setIntakeSuccess(
        `✓ Parcel ${newParcel.trackingNumber} successfully added to inventory! Claim Code [${newParcel.claimCode}] generated & SMS sent to ${resident.name}.`
      );

      // If user was filtering by picked up, reset to ALL so they immediately see the new item
      if (statusFilter === "PICKED_UP") {
        setStatusFilter("ALL");
      }
      setCurrentPage(1);

      // Reset input for next scan
      setTrackingInput("");
      setNotes("");

      // Focus back for next package scan
      setTimeout(() => {
        trackingInputRef.current?.focus();
      }, 100);
    } catch (err) {
      console.error(err);
      setIntakeError("Failed to log parcel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute live KPIs
  const readyCount = parcels.filter((p) => p.status === "READY").length;
  const overdueCount = parcels.filter((p) => p.status === "OVERDUE").length;
  const pickedUpCount = parcels.filter((p) => p.status === "PICKED_UP").length;

  // Filtered Parcels for the Table
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const codeQ = quickPasscodeSearch.trim().toLowerCase();

      // Quick Passcode Search takes priority if entered
      if (codeQ) {
        return (
          p.claimCode.toLowerCase().includes(codeQ) ||
          p.trackingNumber.toLowerCase().includes(codeQ)
        );
      }

      const matchesSearch =
        !q ||
        p.trackingNumber.toLowerCase().includes(q) ||
        p.residentName.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q) ||
        p.courier.toLowerCase().includes(q) ||
        p.claimCode.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [parcels, searchQuery, statusFilter, quickPasscodeSearch]);

  // 5-item pagination for Inventory Table
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, quickPasscodeSearch]);

  const totalPages = Math.ceil(filteredParcels.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredParcels.length);

  const paginatedParcels = useMemo(() => {
    return filteredParcels.slice(startIndex, endIndex);
  }, [filteredParcels, startIndex, endIndex]);

  // Handle opening release modal
  const handleOpenReleaseModal = (parcel: Parcel) => {
    setReleaseModalParcel(parcel);
    setRecipientNameInput(parcel.residentName);
  };

  // Confirm Release Action
  const handleConfirmRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalParcel) return;
    try {
      const recipient = recipientNameInput.trim() || releaseModalParcel.residentName;
      await releaseParcel(releaseModalParcel.id, recipient);
      setReleaseSuccess(`✓ Parcel ${releaseModalParcel.trackingNumber} successfully released to ${recipient}!`);
      setReleaseModalParcel(null);
      setRecipientNameInput("");
      setTimeout(() => setReleaseSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to release parcel.");
    }
  };

  // Revert Release
  const handleRevertStatus = async (parcel: Parcel) => {
    if (confirm(`Revert package ${parcel.trackingNumber} back to READY FOR PICKUP?`)) {
      await updateParcel(parcel.id, {
        status: "READY",
        claimedAt: undefined,
        claimedBy: undefined,
      });
    }
  };

  // Delete Action
  const handleDelete = async (parcel: Parcel) => {
    if (confirm(`Are you sure you want to remove package ${parcel.trackingNumber} from inventory?`)) {
      await deleteParcel(parcel.id);
      if (newlyLoggedId === parcel.id) {
        setNewlyLoggedId(null);
      }
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            PARCEL <span className="text-brand-red">INVENTORY</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Buildersville Condominium • Inbound Barcode Intake & Real-Time Package Inventory Registry
          </p>
        </div>
      </div>

      {/* COMBINED SCANNER & QUICK INTAKE BOX */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <div className="bg-brand-red text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase">
              SCANNER & QUICK INTAKE
            </h2>
            <p className="text-xs text-white/80">
              Scan barcode with USB gun or type tracking number. The parcel will immediately reflect on the inventory below.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                const sampleNumber = "SPX-PH-" + Math.floor(100000 + Math.random() * 900000);
                handleTrackingChange(sampleNumber);
              }}
              className="text-[11px] bg-white text-brand-red font-bold uppercase px-3 py-1.5 rounded-lg shadow-xs hover:bg-gray-100 cursor-pointer"
            >
              + Quick Fill Sample
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {intakeSuccess && (
          <div className="bg-green-50 border-b border-green-200 text-green-900 px-6 py-3.5 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
              <span className="font-semibold">{intakeSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setIntakeSuccess(null)}
              className="text-green-700 hover:text-green-950 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {intakeError && (
          <div className="bg-red-50 border-b border-red-200 text-red-800 px-6 py-3 flex items-center justify-between text-xs animate-in fade-in">
            <span>{intakeError}</span>
            <button
              type="button"
              onClick={() => setIntakeError(null)}
              className="text-red-700 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Intake Form */}
        <form onSubmit={handleIntakeSubmit} className="p-6 space-y-5">
          {/* Row 1: Primary Intake Fields (Tracking, Courier, Resident) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* 1. Barcode / Tracking input */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-brand-text">
                  Courier Tracking / Barcode <span className="text-brand-red">*</span>
                </label>
                <span className="text-[11px] text-gray-500 font-medium">USB Gun Ready</span>
              </div>
              <input
                ref={trackingInputRef}
                type="text"
                placeholder="Scan barcode with gun or type tracking..."
                value={trackingInput}
                onChange={(e) => handleTrackingChange(e.target.value)}
                className="input font-mono uppercase text-sm w-full font-bold border border-gray-300 bg-white h-11"
                required
                disabled={isSubmitting}
                autoFocus
              />
              <div className="mt-1 text-[11px] text-brand-text-secondary">
                Auto-detected: <strong className="text-brand-red">{courier}</strong>
              </div>
            </div>

            {/* 2. Courier Selector */}
            <div className="md:col-span-3 flex flex-col justify-between">
              <label className="text-xs font-bold uppercase text-brand-text mb-1.5">
                Courier Partner
              </label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white font-medium h-11"
                disabled={isSubmitting}
              >
                <option value="SPX Express">SPX Express</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Flash Express">Flash Express</option>
                <option value="Lazada Lex">Lazada Lex</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Ninja Van">Ninja Van</option>
                <option value="LBC Express">LBC Express</option>
                <option value="Grab / Lalamove">Grab / Lalamove</option>
              </select>
              <div className="mt-1 text-[11px] text-brand-text-secondary">
                Select logistics carrier
              </div>
            </div>

            {/* 3. Resident & Unit Selector */}
            <div className="md:col-span-4 flex flex-col justify-between">
              <label className="text-xs font-bold uppercase text-brand-text mb-1.5">
                Condo Resident & Unit <span className="text-brand-red">*</span>
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white font-medium h-11"
                disabled={isSubmitting}
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — Unit {r.unit} ({r.tower})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] text-brand-text-secondary">
                Receiver condo resident
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Attributes (Size, Notes, Submit Button) */}
          <div className="pt-4 border-t border-brand-border grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            {/* Size Options */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Parcel Size
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Small", "Medium", "Large", "Oversize"] as ParcelSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setParcelSize(sz)}
                    className={`h-10 text-xs rounded-lg border font-bold transition-all cursor-pointer ${
                      parcelSize === sz
                        ? "bg-brand-black text-white border-brand-black shadow-xs"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Package Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Fragile, Perishable, Shopee Pay..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input text-xs w-full border border-gray-300 bg-white h-10 font-medium"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full h-10 font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md text-xs"
              >
                {isSubmitting ? (
                  <span>Logging Inbound Parcel...</span>
                ) : (
                  <span>LOG PARCEL & UPDATE INVENTORY ➔</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Release Notification Alert */}
      {releaseSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <span>{releaseSuccess}</span>
          <button
            onClick={() => setReleaseSuccess(null)}
            className="text-blue-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* LIVE PARCEL ACTIVITY STREAM / PARCEL INVENTORY (Exact UI from previous Activity Stream) */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm space-y-4 p-6">
        {/* Table Header & Search Tools */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl uppercase tracking-wider text-brand-black">
              PARCEL INVENTORY
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Real-time inventory stream. You can release parcels directly or update statuses in one click.
            </p>
          </div>

          {/* Quick Passcode Search Box */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Claim Passcode (e.g. CK-8921)..."
                value={quickPasscodeSearch}
                onChange={(e) => setQuickPasscodeSearch(e.target.value)}
                className="input px-3 text-xs font-mono uppercase w-full bg-white border border-gray-300 focus:border-brand-red"
              />
            </div>

            <div className="relative w-full sm:w-60">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search tracking, resident, unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs w-full border border-gray-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex gap-1.5 bg-brand-surface p-1 rounded-xl text-xs font-bold uppercase">
            {[
              { id: "ALL", label: `All (${parcels.length})` },
              { id: "READY", label: `Ready for Pickup (${readyCount})` },
              { id: "OVERDUE", label: `Overdue (${overdueCount})` },
              { id: "PICKED_UP", label: `Released (${pickedUpCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-brand-red text-white shadow-sm"
                    : "text-brand-text-secondary hover:text-brand-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {quickPasscodeSearch && (
            <button
              type="button"
              onClick={() => setQuickPasscodeSearch("")}
              className="text-xs text-brand-red font-semibold hover:underline cursor-pointer"
            >
              Clear Passcode Filter ✕
            </button>
          )}
        </div>

        {/* Parcels Table (Shelf column removed) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface text-brand-text-secondary uppercase border-b border-brand-border">
              <tr>
                <th className="px-4 py-3">Tracking & Courier</th>
                <th className="px-4 py-3">Resident & Unit</th>
                <th className="px-4 py-3">Arrival / Scan Time</th>
                <th className="px-4 py-3">Claim Code</th>
                <th className="px-4 py-3">Status Action</th>
                <th className="px-4 py-3 text-right">Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-brand-text-secondary">
                    No parcels found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedParcels.map((parcel) => {
                  const isReady = parcel.status === "READY";
                  const isOverdue = parcel.status === "OVERDUE";
                  const isPickedUp = parcel.status === "PICKED_UP";
                  const isJustLogged = newlyLoggedId === parcel.id;

                  return (
                    <tr
                      key={parcel.id}
                      className={`hover:bg-brand-surface/60 transition-colors ${
                        isJustLogged
                          ? "bg-green-50 ring-2 ring-green-500/50"
                          : quickPasscodeSearch &&
                            parcel.claimCode.toLowerCase().includes(quickPasscodeSearch.toLowerCase())
                          ? "bg-yellow-50"
                          : ""
                      }`}
                    >
                      {/* Tracking & Courier */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-brand-black">
                            {parcel.trackingNumber}
                          </span>
                          {isJustLogged && (
                            <span className="bg-green-600 text-white font-sans text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                              Just Logged ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: parcel.courierColor }}
                          />
                          <span className="text-[11px] font-semibold text-brand-text-secondary">
                            {parcel.courier}
                          </span>
                          <span className="text-[10px] text-brand-text-muted">({parcel.size || "Standard"})</span>
                          {parcel.notes && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-medium">
                              {parcel.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resident & Unit */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm text-brand-black">{parcel.residentName}</div>
                        <div className="text-[11px] text-brand-text-secondary font-medium">
                          {parcel.unit}
                        </div>
                      </td>

                      {/* Arrival / Scanned Time */}
                      <td className="px-4 py-3.5 text-brand-text-secondary">
                        <div>{parcel.dateArrived}</div>
                        {isPickedUp ? (
                          <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                            Claimed: {parcel.claimedAt || "Earlier"}
                          </div>
                        ) : (
                          <div className="text-[10px] text-brand-text-muted mt-0.5">
                            Holding Deadline: {parcel.deadline}
                          </div>
                        )}
                      </td>

                      {/* Claim Code */}
                      <td className="px-4 py-3.5 font-mono text-sm font-black text-brand-red">
                        <span className="bg-brand-surface border border-brand-border px-2 py-0.5 rounded">
                          {parcel.claimCode}
                        </span>
                      </td>

                      {/* Status Action (INLINE EDITABLE) */}
                      <td className="px-4 py-3.5">
                        {isPickedUp ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <span>✓</span>
                              <span>Released</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevertStatus(parcel)}
                              className="text-[10px] text-brand-text-muted hover:text-brand-red underline cursor-pointer"
                              title="Revert back to Ready for Pickup"
                            >
                              Revert
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                isOverdue
                                  ? "bg-brand-red-light text-brand-red"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {isOverdue ? `Overdue (${parcel.holdingFee})` : "Ready for Pickup"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenReleaseModal(parcel)}
                              className="btn btn-sm bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-1 px-3 uppercase cursor-pointer"
                            >
                              Release ➔
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Tools */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(parcel)}
                          className="text-xs font-semibold text-brand-red hover:text-brand-red-dark hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5-Item Pagination Controls Footer */}
        {filteredParcels.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-brand-border">
            <div className="text-xs text-brand-text-secondary font-medium text-center sm:text-left">
              Showing{" "}
              <span className="font-bold text-brand-black">
                {filteredParcels.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-brand-black">{endIndex}</span>{" "}
              of{" "}
              <span className="font-bold text-brand-black">{filteredParcels.length}</span>{" "}
              packages
              {totalPages > 1 && (
                <span className="ml-1 text-brand-text-muted font-semibold">
                  (Page {validPage} of {totalPages})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage <= 1}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  validPage <= 1
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                }`}
                title="Previous page"
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    validPage === pageNum
                      ? "bg-brand-red text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                  validPage >= totalPages
                    ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                }`}
                title="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Release Confirmation Modal */}
      {releaseModalParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider text-brand-black">
                CONFIRM RELEASE
              </h3>
              <button
                onClick={() => setReleaseModalParcel(null)}
                className="text-brand-text-muted hover:text-brand-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Tracking #:</span>
                <span className="font-mono font-bold text-brand-black">
                  {releaseModalParcel.trackingNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Resident:</span>
                <span className="font-bold text-brand-black">{releaseModalParcel.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Unit / Tower:</span>
                <span className="font-semibold text-brand-text">{releaseModalParcel.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Claim Passcode:</span>
                <span className="font-mono font-black text-brand-black bg-white px-2 py-0.5 rounded border border-brand-border">
                  {releaseModalParcel.claimCode}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmRelease} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                  Recipient Name (Resident or Authorized Proxy)
                </label>
                <input
                  type="text"
                  required
                  value={recipientNameInput}
                  onChange={(e) => setRecipientNameInput(e.target.value)}
                  placeholder="Enter name of person claiming..."
                  className="input text-xs w-full border border-gray-300 bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalParcel(null)}
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  Confirm & Release ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
