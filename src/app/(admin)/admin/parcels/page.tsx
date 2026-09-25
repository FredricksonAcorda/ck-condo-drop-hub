"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useParcels, useAuth } from "@/context";
import { Parcel, ParcelStatus } from "@/types";
import { printThermalShelfLabel, printClaimReleaseSlip } from "@/lib/print/label-generator";

export default function ParcelsInventoryPage() {
  const { parcels, releaseParcel, deleteParcel, hubSettings } = useParcels();
  const { user } = useAuth();

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

      // Shelf Zone (Shelf A, Shelf B, Shelf C, Archived)
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
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            HUB PARCEL <span className="text-brand-red">INVENTORY</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Complete package registry, shelf slot occupancy, thermal label printing, and release audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/scanner" className="btn btn-primary btn-sm">
            Open Scanner
          </Link>
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Lobby Intake
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {actionAlert && (
        <div className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{actionAlert}</span>
          <button
            onClick={() => setActionAlert(null)}
            className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 bg-black/20 rounded"
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
              placeholder="Search tracking, resident, unit, shelf, or claim passcode..."
              className="input pl-9 text-xs sm:text-sm font-medium w-full border border-gray-300 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-text-muted hover:text-brand-black"
              >
                ✕
              </button>
            )}
          </div>

          {/* Courier Dropdown */}
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            className="input text-xs font-semibold py-2 px-3 md:w-48 border border-gray-300 bg-white"
          >
            <option value="ALL">All Couriers</option>
            <option value="SPX Express">SPX Express</option>
            <option value="J&T Express">J&T Express</option>
            <option value="Flash Express">Flash Express</option>
            <option value="LBC Express">LBC Express</option>
            <option value="Ninja Van">Ninja Van</option>
          </select>

          {/* Shelf Zone Dropdown */}
          <select
            value={shelfZoneFilter}
            onChange={(e) => setShelfZoneFilter(e.target.value)}
            className="input text-xs font-semibold py-2 px-3 md:w-44 border border-gray-300 bg-white"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
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

      {/* Main Parcels Table */}
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
                filteredParcels.map((p) => {
                  const isPickedUp = p.status === "PICKED_UP";
                  const isOverdue = p.status === "OVERDUE";

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-brand-surface/70 transition-colors group"
                    >
                      {/* Package & Tracking */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-black text-brand-black text-sm tracking-wide">
                          {p.trackingNumber}
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
                              ● Ready
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
                            className="p-1.5 bg-brand-surface hover:bg-gray-200 border border-brand-border rounded text-xs font-semibold"
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
                            className="p-1.5 bg-brand-surface hover:bg-gray-200 border border-brand-border rounded text-xs font-semibold"
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
                              className="btn btn-primary btn-sm text-[11px] py-1 px-2.5 font-bold uppercase"
                            >
                              Release
                            </button>
                          )}

                          {/* Details / Inspection */}
                          <button
                            type="button"
                            onClick={() => setSelectedParcel(p)}
                            className="p-1.5 hover:bg-gray-100 text-brand-text-secondary rounded text-xs font-semibold"
                            title="Inspect Details"
                          >
                            View
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded text-xs font-semibold"
                            title="Delete Record"
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
      </div>

      {/* Release Confirmation Modal */}
      {releaseModalParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-brand-border">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase text-brand-black">
                CONFIRM PARCEL RELEASE
              </h3>
              <button
                onClick={() => setReleaseModalParcel(null)}
                className="text-brand-text-muted hover:text-brand-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-1">
              <div className="text-[10px] font-bold uppercase text-brand-text-muted">
                {releaseModalParcel.courier} • Slot {releaseModalParcel.shelf}
              </div>
              <div className="font-mono text-base font-black text-brand-black">
                {releaseModalParcel.trackingNumber}
              </div>
              <div className="text-xs text-brand-text font-bold">
                Assigned to: {releaseModalParcel.residentName} ({releaseModalParcel.unit})
              </div>
            </div>

            <form onSubmit={handleConfirmRelease} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-brand-text mb-1">
                  Claimant Name (Resident or Proxy)
                </label>
                <input
                  type="text"
                  value={recipientNameInput}
                  onChange={(e) => setRecipientNameInput(e.target.value)}
                  className="input text-sm"
                  required
                />
                <span className="text-[10px] text-brand-text-muted mt-1 block">
                  Verify government ID or proxy authorization letter if not primary resident.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalParcel(null)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  CONFIRM RELEASE ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parcel Detail Inspection Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-brand-border">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-text-muted">
                  PARCEL AUDIT INSPECTOR
                </span>
                <h3 className="font-mono text-lg font-black text-brand-black">
                  {selectedParcel.trackingNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-brand-text-muted hover:text-brand-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Courier</span>
                <span className="font-bold text-brand-black">{selectedParcel.courier}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Shelf Slot</span>
                <span className="font-mono font-bold text-brand-black">{selectedParcel.shelf}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Resident</span>
                <span className="font-bold text-brand-black">{selectedParcel.residentName}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Unit</span>
                <span className="font-bold text-brand-black">{selectedParcel.unit}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Claim Passcode</span>
                <span className="font-mono font-black text-brand-red">{selectedParcel.claimCode}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Current Status</span>
                <span className="font-bold text-brand-black">{selectedParcel.status}</span>
              </div>

              <div className="bg-brand-surface p-3 rounded-lg border border-brand-border col-span-2">
                <span className="text-[10px] text-brand-text-muted uppercase font-bold block">Arrival Timestamp</span>
                <span className="text-brand-text">{selectedParcel.dateArrived}</span>
              </div>

              {selectedParcel.claimedAt && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 col-span-2">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Release Record</span>
                  <span className="text-blue-900 font-semibold">
                    Released on {selectedParcel.claimedAt} to {selectedParcel.claimedBy}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-brand-border">
              <button
                type="button"
                onClick={() => {
                  printThermalShelfLabel({
                    parcel: selectedParcel,
                    hubName: hubSettings.hubName,
                    station: hubSettings.stationName,
                  });
                }}
                className="btn btn-outline flex-1 text-xs"
              >
                Print Thermal Sticker
              </button>
              <button
                type="button"
                onClick={() => {
                  printClaimReleaseSlip({
                    parcel: selectedParcel,
                    releasedByStaff: user?.name || "Staff Admin",
                    hubName: hubSettings.hubName,
                  });
                }}
                className="btn btn-primary flex-1 text-xs"
              >
                Print Release Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
