"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useParcels, useAuth } from "@/context";
import { db } from "@/lib/db/local-store";
import { ResidentProfile, Parcel, ParcelStatus } from "@/types";
import { detectCourierFromBarcode } from "@/lib/scanner/courier-detector";
import { printThermalShelfLabel, printClaimReleaseSlip } from "@/lib/print/label-generator";

function AdminDashboardContent() {
  const { user } = useAuth();
  const { parcels, logParcel, releaseParcel, updateParcel, deleteParcel, hubSettings, inquiries } = useParcels();

  // Resident directory for intake selector
  const [residents, setResidents] = useState<ResidentProfile[]>([]);

  // Workflow 1: Quick Intake Scanner state
  const [trackingInput, setTrackingInput] = useState("");
  const [courier, setCourier] = useState("SPX Express");
  const [selectedResidentId, setSelectedResidentId] = useState("");
  const [shelf, setShelf] = useState("Shelf A-04");
  const [parcelSize, setParcelSize] = useState<"Small" | "Medium" | "Large" | "Oversize">("Small");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiveSuccess, setReceiveSuccess] = useState<string | null>(null);
  const [lastCreatedParcel, setLastCreatedParcel] = useState<Parcel | null>(null);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Workflow 2: Quick Release Modal state
  const [releaseModalParcel, setReleaseModalParcel] = useState<Parcel | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<string | null>(null);
  const [lastReleasedParcel, setLastReleasedParcel] = useState<Parcel | null>(null);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ParcelStatus>("ALL");
  const [quickPasscodeSearch, setQuickPasscodeSearch] = useState("");

  // Load residents on mount
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

  // Auto-detect courier when staff scans or types tracking number
  const handleTrackingChange = (value: string) => {
    setTrackingInput(value);
    if (receiveError) setReceiveError(null);

    if (value.trim().length >= 3) {
      const detected = detectCourierFromBarcode(value.trim());
      if (detected.confidence !== "UNKNOWN") {
        setCourier(detected.name);
      }
    }
  };

  // Compute live KPIs
  const readyCount = parcels.filter((p) => p.status === "READY").length;
  const overdueCount = parcels.filter((p) => p.status === "OVERDUE").length;
  const activeInHub = readyCount + overdueCount;
  const pickedUpCount = parcels.filter((p) => p.status === "PICKED_UP").length;

  // Filtered Parcels for the Live Activity Table
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
        p.shelf.toLowerCase().includes(q) ||
        p.courier.toLowerCase().includes(q) ||
        p.claimCode.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [parcels, searchQuery, statusFilter, quickPasscodeSearch]);

  // 5-item pagination for Live Activity Stream
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

  // Handle Quick Intake Form Submit
  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiveError(null);
    setReceiveSuccess(null);

    if (!trackingInput.trim()) {
      setReceiveError("Please scan or type a courier tracking number.");
      return;
    }

    const resident = residents.find((r) => r.id === selectedResidentId);
    if (!resident) {
      setReceiveError("Please select a registered condo resident.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newParcel = await logParcel({
        trackingNumber: trackingInput.trim().toUpperCase(),
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
        `✓ Parcel ${newParcel.trackingNumber} logged into ${newParcel.shelf}! Passcode [${newParcel.claimCode}] generated & SMS alert sent to ${resident.name} (${resident.phone}).`
      );

      // Reset input for next scan immediately
      setTrackingInput("");
      setNotes("");

      // Automatically print thermal shelf label if setting enabled
      if (hubSettings.autoPrintIntakeLabel) {
        printThermalShelfLabel({
          parcel: newParcel,
          hubName: hubSettings.hubName,
          station: hubSettings.stationName,
        });
      }
    } catch (err: unknown) {
      setReceiveError(err instanceof Error ? err.message : "Failed to log parcel");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Release Dialog for a specific parcel
  const handleOpenReleaseModal = (parcel: Parcel) => {
    setReleaseModalParcel(parcel);
    setRecipientNameInput(parcel.residentName);
  };

  // Confirm Release of Parcel
  const handleConfirmRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalParcel) return;

    setIsReleasing(true);
    try {
      const recipient = recipientNameInput.trim() || releaseModalParcel.residentName;
      const released = await releaseParcel(releaseModalParcel.id, recipient);
      setLastReleasedParcel(released);
      setReleaseSuccess(`✓ Parcel ${released.trackingNumber} successfully released to ${recipient}!`);
      setReleaseModalParcel(null);
      setRecipientNameInput("");
      setQuickPasscodeSearch("");
    } catch (err) {
      console.error(err);
      alert("Failed to release parcel.");
    } finally {
      setIsReleasing(false);
    }
  };

  // Direct 1-Click Status Revert (if marked by mistake)
  const handleRevertStatus = async (parcel: Parcel) => {
    if (confirm(`Revert package ${parcel.trackingNumber} back to READY FOR PICKUP?`)) {
      await updateParcel(parcel.id, {
        status: "READY",
        shelf: "Shelf A-01",
        claimedAt: undefined,
        claimedBy: undefined,
      });
    }
  };

  // Delete parcel from records
  const handleDeleteParcel = async (parcel: Parcel) => {
    if (confirm(`Remove package ${parcel.trackingNumber} from inventory records?`)) {
      await deleteParcel(parcel.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Station Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-700">
              LOBBY COUNTER • ONLINE
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide mt-1">
            LOBBY <span className="text-brand-red">OPERATIONS</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Buildersville Condominium • Fast Inbound Barcode Scanning & Instant Resident Release
          </p>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/scanner"
            className="btn btn-outline btn-sm font-bold uppercase cursor-pointer"
          >
            Camera Scanner
          </Link>
          <button
            type="button"
            onClick={() => {
              const sampleNumber = "SPX-PH-" + Math.floor(100000 + Math.random() * 900000);
              handleTrackingChange(sampleNumber);
            }}
            className="btn btn-primary btn-sm font-bold uppercase cursor-pointer"
            title="Generate sample tracking number for testing"
          >
            + Sample Scan
          </button>
        </div>
      </div>

      {/* Pending Inquiries Alert Banner */}
      {inquiries.filter((i) => i.status === "NEW").length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <span className="text-xs text-amber-950 font-bold block">
                {inquiries.filter((i) => i.status === "NEW").length} Unattended Resident Lobby Inquir{inquiries.filter((i) => i.status === "NEW").length === 1 ? "y" : "ies"}
              </span>
              <span className="text-[11px] text-amber-800">
                Residents have sent messages regarding misplaced parcels, proxy claimants, or doorstep concierge runs.
              </span>
            </div>
          </div>
          <Link
            href="/admin/inquiries"
            className="btn btn-primary btn-sm text-xs font-bold uppercase whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            Review Inquiries ({inquiries.filter((i) => i.status === "NEW").length}) →
          </Link>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-l-4 border-l-green-600 border border-brand-border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            READY FOR PICKUP
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1">
            {readyCount}
          </div>
          <span className="text-[11px] text-green-700 font-semibold">Active packages on shelves</span>
        </div>

        <div className="bg-white border-l-4 border-l-brand-red border border-brand-border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            OVERDUE STORAGE
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-red mt-1">
            {overdueCount}
          </div>
          <span className="text-[11px] text-brand-red font-semibold">
            {overdueCount > 0 ? "Subject to ₱20/day holding fee" : "None past holding limit"}
          </span>
        </div>

        <div className="bg-white border-l-4 border-l-blue-600 border border-brand-border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            RELEASED / CLAIMED
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1">
            {pickedUpCount}
          </div>
          <span className="text-[11px] text-blue-600 font-semibold">Handed to residents</span>
        </div>

        <div className="bg-white border-l-4 border-l-brand-dark border border-brand-border rounded-xl p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary block">
            REGISTERED UNITS
          </span>
          <div className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black mt-1">
            {residents.length}
          </div>
          <span className="text-[11px] text-brand-text-secondary font-semibold">Active resident accounts</span>
        </div>
      </div>

      {/* Notifications / Feedback */}
      {receiveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in shadow-sm">
          <span className="font-medium">{receiveSuccess}</span>
          <div className="flex items-center gap-2 shrink-0">
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
                className="btn btn-sm bg-green-700 hover:bg-green-800 text-white text-xs font-bold cursor-pointer"
              >
                Print Shelf Label
              </button>
            )}
            <button onClick={() => setReceiveSuccess(null)} className="text-green-700 font-bold ml-1 cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}

      {receiveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <span className="font-medium">{receiveError}</span>
          <button onClick={() => setReceiveError(null)} className="text-red-700 font-bold ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {releaseSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in shadow-sm">
          <span className="font-medium">{releaseSuccess}</span>
          <div className="flex items-center gap-2 shrink-0">
            {lastReleasedParcel && (
              <button
                type="button"
                onClick={() =>
                  printClaimReleaseSlip({
                    parcel: lastReleasedParcel,
                    releasedByStaff: user?.name || "Lobby Staff Admin",
                    hubName: hubSettings.hubName,
                  })
                }
                className="btn btn-sm bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Print Release Slip
              </button>
            )}
            <button onClick={() => setReleaseSuccess(null)} className="text-blue-700 font-bold ml-1 cursor-pointer">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* WORKFLOW 1: QUICK INBOUND PARCEL SCANNER BAR */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <div className="bg-brand-red text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase">
              QUICK INBOUND PARCEL SCANNER
            </h2>
            <p className="text-xs text-white/80">
              Scan courier barcode with USB gun or type tracking. Dispatches instant SMS to resident.
            </p>
          </div>
          <span className="hidden sm:inline-block bg-white/20 text-xs px-3 py-1 rounded-full font-bold uppercase">
            Step 1: Courier Drop
          </span>
        </div>

        <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* 1. Barcode / Tracking input */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Tracking Number / Barcode <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Scan barcode with scanner gun or type..."
                  value={trackingInput}
                  onChange={(e) => handleTrackingChange(e.target.value)}
                  className="input font-mono uppercase text-sm w-full font-bold border border-gray-300 bg-white"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-brand-text-secondary">
                <span>Detected: <strong className="text-brand-red">{courier}</strong></span>
                <button
                  type="button"
                  onClick={() => handleTrackingChange("SPX-PH-2026-" + Math.floor(1000 + Math.random() * 9000))}
                  className="text-brand-red hover:underline font-semibold cursor-pointer"
                >
                  Quick Fill Test
                </button>
              </div>
            </div>

            {/* 2. Courier Dropdown */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Courier Partner
              </label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white"
                disabled={isSubmitting}
              >
                <option value="SPX Express">SPX Express</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Flash Express">Flash Express</option>
                <option value="LBC Express">LBC Express</option>
                <option value="Ninja Van">Ninja Van</option>
                <option value="DHL Express">DHL Express</option>
                <option value="GrabExpress">GrabExpress</option>
                <option value="Lalamove">Lalamove</option>
              </select>
            </div>

            {/* 3. Resident Recipient & Unit */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Recipient & Unit <span className="text-brand-red">*</span>
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white"
                disabled={isSubmitting}
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.unit} – {r.name} ({r.plan === "PREMIUM" ? "Premium VIP • 7d" : r.plan === "REGULAR" ? "Regular • 3d" : "Per Parcel • 2d"})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Shelf Slot */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Assign Shelf Bin
              </label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white"
                disabled={isSubmitting}
              >
                <option value="Shelf A-01">Shelf A-01 (Small)</option>
                <option value="Shelf A-04">Shelf A-04 (Shopee/Lazada)</option>
                <option value="Shelf B-02">Shelf B-02 (Medium)</option>
                <option value="Shelf B-12">Shelf B-12 (J&T Bins)</option>
                <option value="Shelf C-01">Shelf C-01 (Large Boxes)</option>
                <option value="Oversize Area (Floor)">Oversize Area (Floor)</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-brand-border">
            <div className="flex items-center gap-3 text-xs text-brand-text-secondary">
              <span className="flex items-center gap-1">
                <span className="text-green-600 font-bold">✓</span> Auto-generates unique 4-digit claim code
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600 font-bold">✓</span> Auto-sends SMS arrival alert
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full sm:w-auto px-6 py-3 font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <span>Logging Inbound Parcel...</span>
              ) : (
                <span>LOG PARCEL & SEND SMS NOTIFICATION</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* WORKFLOW 2: LIVE PARCEL ACTIVITY STREAM WITH INLINE EDITABLE STATUS */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm space-y-4 p-6">
        {/* Table Header & Search Tools */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-brand-border pb-4">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl uppercase tracking-wider text-brand-black">
              LIVE PARCEL ACTIVITY STREAM
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

        {/* Parcels Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface text-brand-text-secondary uppercase border-b border-brand-border">
              <tr>
                <th className="px-4 py-3">Tracking & Courier</th>
                <th className="px-4 py-3">Resident & Unit</th>
                <th className="px-4 py-3">Shelf Slot</th>
                <th className="px-4 py-3">Arrival / Scan Time</th>
                <th className="px-4 py-3">Claim Code</th>
                <th className="px-4 py-3">Status Action</th>
                <th className="px-4 py-3 text-right">Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-brand-text-secondary">
                    No parcels found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedParcels.map((parcel) => {
                  const isReady = parcel.status === "READY";
                  const isOverdue = parcel.status === "OVERDUE";
                  const isPickedUp = parcel.status === "PICKED_UP";

                  return (
                    <tr
                      key={parcel.id}
                      className={`hover:bg-brand-surface/60 transition-colors ${
                        quickPasscodeSearch &&
                        parcel.claimCode.toLowerCase().includes(quickPasscodeSearch.toLowerCase())
                          ? "bg-yellow-50"
                          : ""
                      }`}
                    >
                      {/* Tracking & Courier */}
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-sm text-brand-black">
                          {parcel.trackingNumber}
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
                        </div>
                      </td>

                      {/* Resident & Unit */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-sm text-brand-black">{parcel.residentName}</div>
                        <div className="text-[11px] text-brand-text-secondary font-medium">
                          {parcel.unit}
                        </div>
                      </td>

                      {/* Shelf Slot */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block font-mono font-bold bg-brand-surface px-2.5 py-1 rounded border border-brand-border text-brand-black text-xs">
                          {parcel.shelf}
                        </span>
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
                        {parcel.claimCode}
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

                      {/* Tools & Print */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              printThermalShelfLabel({
                                parcel,
                                hubName: hubSettings.hubName,
                                station: hubSettings.stationName,
                              })
                            }
                            className="text-xs font-semibold text-brand-text-secondary hover:text-brand-black hover:underline cursor-pointer"
                          >
                            Print Label
                          </button>
                          <span className="text-brand-border">|</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteParcel(parcel)}
                            className="text-xs font-semibold text-brand-red hover:text-brand-red-dark hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
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
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    validPage === pageNum
                      ? "bg-brand-red text-white shadow-sm font-black"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-black bg-white"
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

      {/* QUICK RELEASE CONFIRMATION MODAL */}
      {releaseModalParcel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-brand-border text-left animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-brand-black uppercase">
                  CONFIRM PARCEL RELEASE
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Handoff package to resident / authorized claimant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReleaseModalParcel(null)}
                className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-brand-surface p-3.5 rounded-xl border border-brand-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-text-muted">Tracking Number:</span>
                <span className="font-mono font-bold text-brand-black">{releaseModalParcel.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted">Courier:</span>
                <span className="font-semibold text-brand-black">{releaseModalParcel.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted">Condo Unit:</span>
                <span className="font-bold text-brand-black">{releaseModalParcel.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-muted">Assigned Shelf:</span>
                <span className="font-bold text-brand-red">{releaseModalParcel.shelf}</span>
              </div>
              <div className="flex justify-between border-t border-brand-border pt-1.5">
                <span className="text-brand-text-muted">Holding Status:</span>
                <span className="font-bold text-green-700">{releaseModalParcel.holdingFee}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRelease} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                  Claimed By (Resident or Proxy Name):
                </label>
                <input
                  type="text"
                  value={recipientNameInput}
                  onChange={(e) => setRecipientNameInput(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz (Self) or Maria (Spouse)"
                  className="input w-full text-xs font-semibold border border-gray-300 bg-white"
                  required
                  disabled={isReleasing}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalParcel(null)}
                  className="btn btn-outline btn-sm flex-1 font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReleasing}
                  className="btn btn-primary btn-sm flex-1 font-bold uppercase bg-green-700 hover:bg-green-800 cursor-pointer"
                >
                  {isReleasing ? "Releasing..." : "Confirm & Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-brand-text-secondary">Loading Lobby terminal...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
