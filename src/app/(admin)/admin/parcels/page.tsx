"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { useParcels, useAuth } from "@/context";
import { Parcel, ParcelStatus, ResidentProfile, ParcelSize } from "@/types";
import { db } from "@/lib/db/local-store";
import { detectCourierFromBarcode } from "@/lib/scanner/courier-detector";
import { printThermalShelfLabel, printClaimReleaseSlip } from "@/lib/print/label-generator";

export default function ParcelsInventoryPage() {
  const { parcels, logParcel, releaseParcel, deleteParcel, hubSettings } = useParcels();
  const { user } = useAuth();

  // Registered Residents for quick intake
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");

  // Quick Inbound Scanner Form State
  const [trackingInput, setTrackingInput] = useState("");
  const [courier, setCourier] = useState("SPX Express");
  const [shelf, setShelf] = useState("Shelf A-1");
  const [parcelSize, setParcelSize] = useState<ParcelSize>("Medium");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intakeSuccess, setIntakeSuccess] = useState<string | null>(null);
  const [intakeError, setIntakeError] = useState<string | null>(null);
  const [newlyLoggedId, setNewlyLoggedId] = useState<string | null>(null);
  const [lastLoggedParcel, setLastLoggedParcel] = useState<Parcel | null>(null);

  // Camera Scanner State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trackingInputRef = useRef<HTMLInputElement | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ParcelStatus>("ALL");
  const [courierFilter, setCourierFilter] = useState<string>("ALL");
  const [shelfZoneFilter, setShelfZoneFilter] = useState<string>("ALL");

  // Selection & Action Modals
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [releaseModalParcel, setReleaseModalParcel] = useState<Parcel | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState<string>("");

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

  // Camera management
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCamera) {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.error("Camera access failed:", err);
          setCameraError("Camera access unavailable. You can use USB barcode scanner gun or type tracking number.");
          setShowCamera(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showCamera]);

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

  // Handle Inbound Scan Submit
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
        shelf,
        size: parcelSize,
        notes: notes.trim() || undefined,
      });

      setLastLoggedParcel(newParcel);
      setNewlyLoggedId(newParcel.id);
      setIntakeSuccess(
        `✓ Parcel ${newParcel.trackingNumber} logged into ${newParcel.shelf}! Passcode [${newParcel.claimCode}] generated & SMS sent to ${resident.name}.`
      );

      // If user was filtering by picked up, reset to ALL so they see the new item
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

      // Auto-print thermal label if enabled in settings
      if (hubSettings.autoPrintIntakeLabel) {
        printThermalShelfLabel({
          parcel: newParcel,
          hubName: hubSettings.hubName,
          station: hubSettings.stationName,
        });
      }
    } catch (err) {
      console.error(err);
      setIntakeError("Failed to log parcel. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = parcels.length;
    const active = parcels.filter((p) => p.status !== "PICKED_UP").length;
    const overdue = parcels.filter((p) => p.status === "OVERDUE").length;
    const released = parcels.filter((p) => p.status === "PICKED_UP").length;
    const capacityPct = Math.round((active / (hubSettings.maxShelfSlots || 60)) * 100);

    return { total, active, overdue, released, capacityPct };
  }, [parcels, hubSettings.maxShelfSlots]);

  // Filtered Parcels
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      // Search
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !search ||
        p.trackingNumber.toLowerCase().includes(search) ||
        p.residentName.toLowerCase().includes(search) ||
        p.unit.toLowerCase().includes(search) ||
        p.shelf.toLowerCase().includes(search) ||
        p.courier.toLowerCase().includes(search) ||
        p.claimCode.toLowerCase().includes(search);

      // Status
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

      // Courier
      const matchesCourier = courierFilter === "ALL" || p.courier === courierFilter;

      // Shelf Zone
      const matchesShelf =
        shelfZoneFilter === "ALL" ||
        (shelfZoneFilter === "A" && p.shelf.includes("Shelf A")) ||
        (shelfZoneFilter === "B" && p.shelf.includes("Shelf B")) ||
        (shelfZoneFilter === "C" && p.shelf.includes("Shelf C")) ||
        (shelfZoneFilter === "OVERSIZE" && p.shelf.toLowerCase().includes("oversize")) ||
        (shelfZoneFilter === "ARCHIVED" && p.shelf.toLowerCase().includes("archived"));

      return matchesSearch && matchesStatus && matchesCourier && matchesShelf;
    });
  }, [parcels, searchQuery, statusFilter, courierFilter, shelfZoneFilter]);

  // 5-item pagination for Inventory Table
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, courierFilter, shelfZoneFilter]);

  const totalPages = Math.ceil(filteredParcels.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredParcels.length);

  const paginatedParcels = useMemo(() => {
    return filteredParcels.slice(startIndex, endIndex);
  }, [filteredParcels, startIndex, endIndex]);

  // Release Action
  const handleConfirmRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalParcel) return;
    try {
      const recipient = recipientNameInput.trim() || releaseModalParcel.residentName;
      await releaseParcel(releaseModalParcel.id, recipient);
      setActionAlert(`✓ Parcel ${releaseModalParcel.trackingNumber} successfully released to ${recipient}!`);
      setReleaseModalParcel(null);
      setRecipientNameInput("");
    } catch (err) {
      console.error(err);
      alert("Failed to release parcel.");
    }
  };

  // Delete Action
  const handleDelete = async (parcel: Parcel) => {
    if (confirm(`Are you sure you want to remove package ${parcel.trackingNumber} from inventory?`)) {
      await deleteParcel(parcel.id);
      setActionAlert(`Deleted ${parcel.trackingNumber} from records.`);
      if (newlyLoggedId === parcel.id) {
        setNewlyLoggedId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            PARCEL <span className="text-brand-red">INVENTORY</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Integrated scanner terminal & real-time inventory registry. Scan parcels to immediately log them into the inventory below.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCamera(!showCamera)}
            className={`btn btn-sm font-bold uppercase flex items-center gap-1.5 cursor-pointer ${
              showCamera ? "bg-black text-white" : "btn-outline"
            }`}
          >
            <span>{showCamera ? "Close Camera ✕" : "📷 Camera Scanner"}</span>
          </button>
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Station Dashboard
          </Link>
        </div>
      </div>

      {/* Camera Live Scanner Preview (Collapsible) */}
      {showCamera && (
        <div className="bg-brand-black rounded-2xl p-6 text-white border border-white/10 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Camera Scanner</span>
            </div>
            <span className="text-[11px] text-white/60">Position courier shipping barcode in center frame</span>
          </div>

          <div className="relative max-w-md mx-auto aspect-video bg-black rounded-xl overflow-hidden border border-white/20 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-8 border-2 border-dashed border-brand-red rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-white font-mono uppercase">
                Align Barcode Here
              </span>
            </div>
          </div>

          {cameraError && (
            <p className="text-xs text-red-400 text-center font-medium">{cameraError}</p>
          )}
        </div>
      )}

      {/* COMBINED SCANNER & INTAKE WORKSTATION */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <div className="bg-brand-red text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase flex items-center gap-2">
              <span>SCANNER & QUICK INTAKE</span>
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

        {/* Success Alert with Immediate Thermal Print */}
        {intakeSuccess && (
          <div className="bg-green-50 border-b border-green-200 text-green-900 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
              <span className="font-semibold">{intakeSuccess}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lastLoggedParcel && (
                <button
                  type="button"
                  onClick={() =>
                    printThermalShelfLabel({
                      parcel: lastLoggedParcel,
                      hubName: hubSettings.hubName,
                      station: hubSettings.stationName,
                    })
                  }
                  className="btn btn-sm bg-green-700 hover:bg-green-800 text-white text-xs font-bold cursor-pointer"
                >
                  Print Shelf Label (58mm)
                </button>
              )}
              <button
                type="button"
                onClick={() => setIntakeSuccess(null)}
                className="text-green-700 hover:text-green-950 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
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

        {/* Inbound Intake Form */}
        <form onSubmit={handleIntakeSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* 1. Barcode / Tracking input */}
            <div className="md:col-span-4">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Courier Tracking / Barcode <span className="text-brand-red">*</span>
              </label>
              <input
                ref={trackingInputRef}
                type="text"
                placeholder="Scan barcode with gun or type tracking..."
                value={trackingInput}
                onChange={(e) => handleTrackingChange(e.target.value)}
                className="input font-mono uppercase text-sm w-full font-bold border border-gray-300 bg-white"
                required
                disabled={isSubmitting}
                autoFocus
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-brand-text-secondary">
                <span>Detected: <strong className="text-brand-red">{courier}</strong></span>
                <span className="text-gray-400">USB Gun Ready</span>
              </div>
            </div>

            {/* 2. Courier Selector */}
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
                <option value="Lazada Lex">Lazada Lex</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Ninja Van">Ninja Van</option>
                <option value="LBC Express">LBC Express</option>
                <option value="Grab / Lalamove">Grab / Lalamove</option>
              </select>
            </div>

            {/* 3. Resident & Unit Selector */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Condo Resident & Unit <span className="text-brand-red">*</span>
              </label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="input text-xs w-full cursor-pointer border border-gray-300 bg-white font-medium"
                disabled={isSubmitting}
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — Unit {r.unit} ({r.tower})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Shelf Slot Assignment */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase text-brand-text mb-1.5">
                Shelf Location
              </label>
              <select
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="input text-xs w-full font-mono font-bold cursor-pointer border border-gray-300 bg-white"
                disabled={isSubmitting}
              >
                <optgroup label="Shelf Zone A (Quick Pick)">
                  <option value="Shelf A-1">Shelf A-1</option>
                  <option value="Shelf A-2">Shelf A-2</option>
                  <option value="Shelf A-3">Shelf A-3</option>
                  <option value="Shelf A-4">Shelf A-4</option>
                </optgroup>
                <optgroup label="Shelf Zone B (Standard Boxes)">
                  <option value="Shelf B-1">Shelf B-1</option>
                  <option value="Shelf B-2">Shelf B-2</option>
                  <option value="Shelf B-3">Shelf B-3</option>
                  <option value="Shelf B-4">Shelf B-4</option>
                </optgroup>
                <optgroup label="Shelf Zone C (Extended / Overflow)">
                  <option value="Shelf C-1">Shelf C-1</option>
                  <option value="Shelf C-2">Shelf C-2</option>
                  <option value="Shelf C-3">Shelf C-3</option>
                </optgroup>
                <optgroup label="Floor Staging">
                  <option value="Floor Oversize">Floor Oversize</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Secondary Details: Size, Notes, Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-brand-border">
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-brand-text-secondary">Size:</span>
                {(["Small", "Medium", "Large", "Oversize"] as ParcelSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setParcelSize(sz)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                      parcelSize === sz
                        ? "bg-brand-black text-white border-brand-black"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Optional note (e.g. Fragile, Bulky box)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input text-xs w-full border border-gray-300 bg-white"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full sm:w-auto px-6 py-2.5 font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <span>Logging Inbound Parcel...</span>
              ) : (
                <span>LOG PARCEL & UPDATE INVENTORY ➔</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-lg animate-in fade-in text-xs sm:text-sm">
          <span>{actionAlert}</span>
          <button
            onClick={() => setActionAlert(null)}
            className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 bg-black/20 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Total In Hub</span>
          <div className="text-2xl font-black text-brand-black mt-0.5">{stats.active}</div>
          <span className="text-[10px] text-green-600 font-semibold">Active packages</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Capacity Used</span>
          <div className="text-2xl font-black text-brand-black mt-0.5">{stats.capacityPct}%</div>
          <span className="text-[10px] text-brand-text-secondary">
            {stats.active} / {hubSettings.maxShelfSlots} shelf slots
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Overdue Alerts</span>
          <div className="text-2xl font-black text-brand-red mt-0.5">{stats.overdue}</div>
          <span className="text-[10px] text-brand-red font-semibold">Accruing holding fees</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Released / Claimed</span>
          <div className="text-2xl font-black text-blue-600 mt-0.5">{stats.released}</div>
          <span className="text-[10px] text-blue-600 font-semibold">Archived packages</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-xl border border-brand-border shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">All-Time Recorded</span>
          <div className="text-2xl font-black text-brand-black mt-0.5">{stats.total}</div>
          <span className="text-[10px] text-brand-text-muted font-mono">Registry v1.2</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking, resident, unit, shelf, or 4-digit claim code..."
              className="input pl-9 text-xs sm:text-sm font-medium w-full border border-gray-300 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-text-muted hover:text-brand-black cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Courier Dropdown */}
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="input text-xs font-semibold py-2 px-3 md:w-48 border border-gray-300 bg-white cursor-pointer"
          >
            <option value="ALL">All Couriers</option>
            <option value="SPX Express">SPX Express</option>
            <option value="J&T Express">J&T Express</option>
            <option value="Flash Express">Flash Express</option>
            <option value="Lazada Lex">Lazada Lex</option>
            <option value="TikTok Shop">TikTok Shop</option>
            <option value="LBC Express">LBC Express</option>
            <option value="Ninja Van">Ninja Van</option>
          </select>

          {/* Shelf Zone Dropdown */}
          <select
            value={shelfZoneFilter}
            onChange={(e) => setShelfZoneFilter(e.target.value)}
            className="input text-xs font-semibold py-2 px-3 md:w-44 border border-gray-300 bg-white cursor-pointer"
          >
            <option value="ALL">All Shelf Zones</option>
            <option value="A">Zone A (Shelf A-xx)</option>
            <option value="B">Zone B (Shelf B-xx)</option>
            <option value="C">Zone C (Shelf C-xx)</option>
            <option value="OVERSIZE">Floor / Oversize</option>
            <option value="ARCHIVED">Archived (Released)</option>
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-brand-border">
          {[
            { id: "ALL", label: `All (${parcels.length})` },
            {
              id: "READY",
              label: `Ready for Pickup (${parcels.filter((p) => p.status === "READY").length})`,
            },
            {
              id: "OVERDUE",
              label: `Overdue (${parcels.filter((p) => p.status === "OVERDUE").length})`,
            },
            {
              id: "PICKED_UP",
              label: `Released (${parcels.filter((p) => p.status === "PICKED_UP").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-brand-black text-white"
                  : "bg-brand-surface text-brand-text-secondary hover:text-brand-black hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Parcels Table (Live Inventory Reflection) */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface border-b border-brand-border text-[10px] uppercase font-black tracking-wider text-brand-text-muted">
                <th className="py-3.5 px-4">Package & Tracking</th>
                <th className="py-3.5 px-4">Resident & Unit</th>
                <th className="py-3.5 px-4">Storage Location</th>
                <th className="py-3.5 px-4">Arrived / Deadline</th>
                <th className="py-3.5 px-4">Claim Passcode</th>
                <th className="py-3.5 px-4">Status & Fee</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-text-muted">
                    <span className="text-3xl block mb-2">📭</span>
                    No parcels match your current filter and search query.
                  </td>
                </tr>
              ) : (
                paginatedParcels.map((p) => {
                  const isPickedUp = p.status === "PICKED_UP";
                  const isOverdue = p.status === "OVERDUE";
                  const isJustLogged = newlyLoggedId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-brand-surface/70 transition-colors group ${
                        isJustLogged
                          ? "bg-green-50 ring-2 ring-green-500/50"
                          : ""
                      }`}
                    >
                      {/* Package & Tracking */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-brand-black text-sm tracking-wide">
                            {p.trackingNumber}
                          </span>
                          {isJustLogged && (
                            <span className="bg-green-600 text-white font-sans text-[9px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                              Just Logged ✓
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.courierColor }}
                          />
                          <span className="text-[11px] font-semibold text-brand-text-secondary">
                            {p.courier}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-sans">
                            {p.size || "Medium"}
                          </span>
                          {p.notes && (
                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-sans font-medium">
                              {p.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Resident & Unit */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-brand-black text-sm">
                          {p.residentName}
                        </div>
                        <div className="text-[11px] text-brand-text-secondary font-medium mt-0.5">
                          {p.unit}
                        </div>
                      </td>

                      {/* Storage Location */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block font-bold text-xs px-2.5 py-1 rounded-md font-mono ${
                            isPickedUp
                              ? "bg-gray-100 text-gray-500"
                              : "bg-brand-black text-white"
                          }`}
                        >
                          {p.shelf}
                        </span>
                      </td>

                      {/* Arrived / Deadline */}
                      <td className="py-4 px-4">
                        <div className="text-brand-text font-medium text-[11px]">
                          {p.dateArrived.split("•")[0]}
                        </div>
                        <div
                          className={`text-[10px] font-semibold mt-0.5 ${
                            isOverdue ? "text-brand-red font-bold" : "text-brand-text-muted"
                          }`}
                        >
                          Due: {p.deadline}
                        </div>
                      </td>

                      {/* Claim Passcode */}
                      <td className="py-4 px-4 font-mono font-black text-sm">
                        <span className="bg-brand-surface border border-brand-border px-2 py-0.5 rounded text-brand-black">
                          {p.claimCode}
                        </span>
                      </td>

                      {/* Status & Fee */}
                      <td className="py-4 px-4">
                        {isPickedUp ? (
                          <div>
                            <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Claimed
                            </span>
                            <div className="text-[10px] text-brand-text-muted mt-0.5">
                              by {p.claimedBy || "Resident"}
                            </div>
                          </div>
                        ) : isOverdue ? (
                          <div>
                            <span className="inline-block bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              Overdue
                            </span>
                            <div className="text-[10px] text-brand-red font-bold mt-0.5">
                              {p.holdingFee}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Ready for Pickup
                            </span>
                            <div className="text-[10px] text-green-700 font-semibold mt-0.5">
                              Free Holding
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Shelf Label */}
                          <button
                            type="button"
                            onClick={() =>
                              printThermalShelfLabel({
                                parcel: p,
                                hubName: hubSettings.hubName,
                                station: hubSettings.stationName,
                              })
                            }
                            className="p-1.5 bg-brand-surface hover:bg-gray-200 border border-brand-border rounded text-xs font-semibold cursor-pointer"
                            title="Print Thermal Shelf Sticker (58mm x 40mm)"
                          >
                            Label
                          </button>

                          {/* Print Slip */}
                          <button
                            type="button"
                            onClick={() =>
                              printClaimReleaseSlip({
                                parcel: p,
                                releasedByStaff: user?.name || "Staff Admin",
                                hubName: hubSettings.hubName,
                              })
                            }
                            className="p-1.5 bg-brand-surface hover:bg-gray-200 border border-brand-border rounded text-xs font-semibold cursor-pointer"
                            title="Print Paper Release Receipt"
                          >
                            Slip
                          </button>

                          {/* Release Button */}
                          {!isPickedUp && (
                            <button
                              type="button"
                              onClick={() => {
                                setReleaseModalParcel(p);
                                setRecipientNameInput(p.residentName);
                              }}
                              className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 font-bold uppercase cursor-pointer"
                            >
                              Release
                            </button>
                          )}

                          {/* Details / Inspection */}
                          <button
                            type="button"
                            onClick={() => setSelectedParcel(p)}
                            className="p-1.5 hover:bg-brand-surface rounded text-brand-text-muted hover:text-brand-black cursor-pointer"
                            title="Inspect Details"
                          >
                            👁
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="p-1.5 hover:bg-red-50 rounded text-brand-text-muted hover:text-brand-red cursor-pointer"
                            title="Delete Record"
                          >
                            ✕
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-brand-border bg-white">
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
                CONFIRM HANDOVER
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
                <span className="text-brand-text-secondary">Expected Resident:</span>
                <span className="font-bold text-brand-black">{releaseModalParcel.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Unit / Tower:</span>
                <span className="font-semibold text-brand-text">{releaseModalParcel.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Storage Shelf:</span>
                <span className="font-mono font-bold text-brand-red">{releaseModalParcel.shelf}</span>
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

      {/* Parcel Detail Inspection Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase tracking-wider text-brand-black">
                  PACKAGE INSPECTION
                </h3>
                <p className="text-xs text-brand-text-secondary font-mono">{selectedParcel.id}</p>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-brand-text-muted hover:text-brand-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Tracking Number
                </span>
                <span className="font-mono font-bold text-brand-black">{selectedParcel.trackingNumber}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Courier
                </span>
                <span className="font-semibold text-brand-text">{selectedParcel.courier}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Resident Name
                </span>
                <span className="font-bold text-brand-black">{selectedParcel.residentName}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Unit & Tower
                </span>
                <span className="font-semibold text-brand-text">{selectedParcel.unit}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Storage Slot
                </span>
                <span className="font-mono font-bold text-brand-red">{selectedParcel.shelf}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Claim Passcode
                </span>
                <span className="font-mono font-black text-brand-black">{selectedParcel.claimCode}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Arrived At
                </span>
                <span className="text-brand-text">{selectedParcel.dateArrived}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Holding Deadline
                </span>
                <span className="text-brand-text">{selectedParcel.deadline}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Current Status
                </span>
                <span className="font-bold uppercase text-brand-red">{selectedParcel.status}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Holding Fee
                </span>
                <span className="font-bold text-brand-black">{selectedParcel.holdingFee}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  printThermalShelfLabel({
                    parcel: selectedParcel,
                    hubName: hubSettings.hubName,
                    station: hubSettings.stationName,
                  })
                }
                className="btn btn-outline btn-sm font-bold uppercase cursor-pointer"
              >
                Print Thermal Sticker
              </button>

              <button
                type="button"
                onClick={() => setSelectedParcel(null)}
                className="btn btn-primary btn-sm cursor-pointer"
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
