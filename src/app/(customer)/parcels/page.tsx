"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth, useParcels } from "@/context";

export default function MyParcelsPage() {
  const { user } = useAuth();
  const { parcels, loading } = useParcels();

  // Primary tab view: ALL, READY, HISTORY
  const [tabFilter, setTabFilter] = useState<"ALL" | "READY" | "HISTORY">("ALL");

  // Filter states for Parcel History & Logs
  const [historyTracking, setHistoryTracking] = useState("");
  const [historyCourier, setHistoryCourier] = useState("ALL");
  const [historyDate, setHistoryDate] = useState("");
  const [historyClaimedBy, setHistoryClaimedBy] = useState("");
  const [historyStatus, setHistoryStatus] = useState("ALL");

  // Copy feedback state
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const clearHistoryFilters = () => {
    setHistoryTracking("");
    setHistoryCourier("ALL");
    setHistoryDate("");
    setHistoryClaimedBy("");
    setHistoryStatus("ALL");
  };

  const hasActiveHistoryFilters = Boolean(
    historyTracking.trim() ||
      historyCourier !== "ALL" ||
      historyDate.trim() ||
      historyClaimedBy.trim() ||
      historyStatus !== "ALL"
  );

  // Filter parcels belonging to the current resident
  const userParcels = useMemo(() => {
    return parcels.filter(
      (p) =>
        p.residentId === user?.id ||
        (user?.name && p.residentName.toLowerCase() === user.name.toLowerCase())
    );
  }, [parcels, user]);

  const readyParcels = useMemo(() => {
    return userParcels.filter((p) => p.status === "READY" || p.status === "OVERDUE");
  }, [userParcels]);

  const historyParcels = useMemo(() => {
    return userParcels.filter((p) => p.status === "PICKED_UP");
  }, [userParcels]);

  // Unique couriers present in history
  const availableCouriers = useMemo(() => {
    const set = new Set<string>();
    historyParcels.forEach((p) => {
      if (p.courier) set.add(p.courier);
    });
    // Add common couriers as fallbacks if set is small
    ["SPX Express", "J&T Express", "Flash Express", "LBC Express", "2GO Express"].forEach((c) => set.add(c));
    return Array.from(set).sort();
  }, [historyParcels]);

  // Filtered history parcels based on the 5 filter criteria
  const filteredHistory = useMemo(() => {
    return historyParcels.filter((parcel) => {
      // 1. Tracking Number filter
      if (
        historyTracking.trim() &&
        !parcel.trackingNumber.toLowerCase().includes(historyTracking.trim().toLowerCase())
      ) {
        return false;
      }

      // 2. Courier filter
      if (historyCourier !== "ALL" && parcel.courier !== historyCourier) {
        return false;
      }

      // 3. Date filter (checks claimedAt and dateArrived)
      if (historyDate.trim()) {
        const dTerm = historyDate.trim().toLowerCase();
        const matchesDate =
          (parcel.claimedAt && parcel.claimedAt.toLowerCase().includes(dTerm)) ||
          (parcel.dateArrived && parcel.dateArrived.toLowerCase().includes(dTerm));
        if (!matchesDate) return false;
      }

      // 4. Claimed By filter
      if (historyClaimedBy.trim()) {
        const cTerm = historyClaimedBy.trim().toLowerCase();
        const matchesClaimed =
          (parcel.claimedBy && parcel.claimedBy.toLowerCase().includes(cTerm)) ||
          (parcel.residentName && parcel.residentName.toLowerCase().includes(cTerm));
        if (!matchesClaimed) return false;
      }

      // 5. Status filter
      if (historyStatus !== "ALL" && parcel.status !== historyStatus) {
        return false;
      }

      return true;
    });
  }, [historyParcels, historyTracking, historyCourier, historyDate, historyClaimedBy, historyStatus]);

  const freeHoldingDays = user?.plan === "PREMIUM" ? 7 : 3;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
            MY <span className="text-brand-red">PARCELS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time pickup status and complete delivery history for {user?.name || "your account"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/track" className="btn btn-outline btn-sm font-bold uppercase whitespace-nowrap">
            Track Inbound Parcel ↗
          </Link>
        </div>
      </div>

      {/* Top Filter Tabs: All, Ready for Pickup, Past History */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm text-xs font-bold uppercase">
        {(["ALL", "READY", "HISTORY"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setTabFilter(tab)}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              tabFilter === tab
                ? "bg-brand-red text-white shadow-sm font-black"
                : "text-gray-600 hover:text-black hover:bg-gray-50"
            }`}
          >
            {tab === "ALL"
              ? `All (${userParcels.length})`
              : tab === "READY"
              ? `Ready for Pickup (${readyParcels.length})`
              : `History & Logs (${historyParcels.length})`}
          </button>
        ))}
      </div>

      {/* SECTION 1: Ready for Pickup (Shown if tab is ALL or READY) */}
      {tabFilter !== "HISTORY" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="bg-[#107C41] text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-300 animate-pulse" />
                <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl tracking-wider uppercase">
                  READY FOR PICKUP ({readyParcels.length} {readyParcels.length === 1 ? "PARCEL" : "PARCELS"})
                </h2>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                Station 1 Front Desk • Ground Floor Main Lobby (Open Daily 8:00 AM – 9:00 PM)
              </p>
            </div>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
              Show Tracking # at Desk
            </span>
          </div>

          {/* Lobby Pickup Guideline */}
          <div className="bg-emerald-50 px-5 sm:px-6 py-2.5 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-950 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span>
              To collect your package, simply show the <strong>Tracking Number</strong> from your SMS alert to the front desk receptionist. Free holding allowance: <strong>{freeHoldingDays} days</strong>.
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-gray-500">
              Loading incoming parcels...
            </div>
          ) : readyParcels.length === 0 ? (
            <div className="p-8 sm:p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <p className="text-base font-bold text-gray-900">All caught up! No parcels currently awaiting pickup.</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                When a courier rider delivers a package for {user?.name || "your unit"} at Station 1, our front desk staff will scan it into inventory and you will receive an immediate SMS alert.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Tracking Number</th>
                      <th className="px-6 py-3.5 font-bold">Courier & Shelf</th>
                      <th className="px-6 py-3.5 font-bold">Arrival Date</th>
                      <th className="px-6 py-3.5 font-bold">Pickup Deadline</th>
                      <th className="px-6 py-3.5 font-bold">Holding Status</th>
                      <th className="px-6 py-3.5 font-bold text-right">Lobby Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {readyParcels.map((parcel) => (
                      <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                        {/* Tracking Number */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-gray-900">
                              {parcel.trackingNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(parcel.trackingNumber)}
                              className="text-[11px] px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-black font-semibold cursor-pointer transition-colors"
                              title="Copy tracking number"
                            >
                              {copiedTracking === parcel.trackingNumber ? "Copied!" : "Copy"}
                            </button>
                          </div>
                          {parcel.notes && (
                            <span className="text-[11px] text-gray-500 block mt-0.5">
                              {parcel.notes}
                            </span>
                          )}
                        </td>

                        {/* Courier & Shelf */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: parcel.courierColor }}
                            />
                            <span className="font-semibold text-gray-900 text-xs">{parcel.courier}</span>
                          </div>
                          <span className="inline-block text-[10px] bg-gray-100 text-gray-700 font-mono px-2 py-0.5 rounded border border-gray-200 mt-1">
                            {parcel.shelf}
                          </span>
                        </td>

                        {/* Arrival Date */}
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {parcel.dateArrived}
                        </td>

                        {/* Pickup Deadline */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold ${
                              parcel.status === "OVERDUE"
                                ? "text-brand-red font-bold"
                                : "text-gray-900"
                            }`}
                          >
                            {parcel.deadline}
                          </span>
                        </td>

                        {/* Holding Status / Fee */}
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                              parcel.status === "OVERDUE"
                                ? "bg-red-50 text-brand-red border border-red-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                          >
                            {parcel.holdingFee}
                          </span>
                        </td>

                        {/* Lobby Verification Instruction */}
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                            Present Tracking #
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Stack */}
              <div className="md:hidden divide-y divide-gray-200">
                {readyParcels.map((parcel) => (
                  <div key={parcel.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-base text-gray-900 block">
                          {parcel.trackingNumber}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: parcel.courierColor }}
                          />
                          <span className="text-xs font-semibold text-gray-700">{parcel.courier}</span>
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-mono text-gray-600">
                            {parcel.shelf}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${
                          parcel.status === "OVERDUE"
                            ? "bg-red-50 text-brand-red border border-red-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                      >
                        {parcel.holdingFee}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-gray-500 block text-[11px]">Arrival Date:</span>
                        <span className="font-medium text-gray-900">{parcel.dateArrived}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Pickup Deadline:</span>
                        <span
                          className={`font-medium ${
                            parcel.status === "OVERDUE" ? "text-brand-red font-bold" : "text-gray-900"
                          }`}
                        >
                          {parcel.deadline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(parcel.trackingNumber)}
                        className="btn btn-outline btn-sm font-bold uppercase text-xs cursor-pointer"
                      >
                        {copiedTracking === parcel.trackingNumber ? "Copied to Clipboard!" : "Copy Tracking #"}
                      </button>
                      <span className="text-xs text-gray-500 font-medium">
                        Show at Station 1 Desk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* SECTION 2: Parcel History & Logs (Shown if tab is ALL or HISTORY) */}
      {tabFilter !== "READY" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm space-y-4">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl tracking-wider uppercase text-gray-900">
                PARCEL HISTORY & LOGS
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete archive of claimed packages and past lobby collections
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-700 font-bold px-3 py-1.5 rounded-full border border-gray-200">
                {filteredHistory.length} of {historyParcels.length} Picked Up
              </span>
            </div>
          </div>

          {/* 5 Filter Controls: Tracking Number, Courier, Date, Claimed By, Status */}
          <div className="px-5 sm:px-6">
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Filter History & Logs
                </span>
                {hasActiveHistoryFilters && (
                  <button
                    type="button"
                    onClick={clearHistoryFilters}
                    className="text-xs font-bold text-brand-red hover:underline uppercase cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Filter by Tracking Number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    placeholder="Search tracking #..."
                    value={historyTracking}
                    onChange={(e) => setHistoryTracking(e.target.value)}
                    className="input w-full text-xs"
                  />
                </div>

                {/* 2. Filter by Courier */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Courier
                  </label>
                  <select
                    value={historyCourier}
                    onChange={(e) => setHistoryCourier(e.target.value)}
                    className="input w-full text-xs cursor-pointer"
                  >
                    <option value="ALL">All Couriers</option>
                    {availableCouriers.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Filter by Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Date (Claimed / Arrived)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sept 18, 2026"
                    value={historyDate}
                    onChange={(e) => setHistoryDate(e.target.value)}
                    className="input w-full text-xs"
                  />
                </div>

                {/* 4. Filter by Claimed By */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Claimed By
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Self, Spouse..."
                    value={historyClaimedBy}
                    onChange={(e) => setHistoryClaimedBy(e.target.value)}
                    className="input w-full text-xs"
                  />
                </div>

                {/* 5. Filter by Status */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={historyStatus}
                    onChange={(e) => setHistoryStatus(e.target.value)}
                    className="input w-full text-xs cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PICKED_UP">Picked Up</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table or Empty State */}
          <div className="p-5 sm:p-6 pt-0">
            {historyParcels.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                No completed pick-ups recorded in your history yet.
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-bold text-gray-900">No past parcels match your filters</p>
                <p className="text-xs text-gray-500">
                  Try adjusting the tracking number, courier, date, or claimant search terms.
                </p>
                <button
                  type="button"
                  onClick={clearHistoryFilters}
                  className="btn btn-outline btn-sm font-bold uppercase text-xs mt-2"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-3 font-bold">Tracking Number</th>
                        <th className="px-5 py-3 font-bold">Courier</th>
                        <th className="px-5 py-3 font-bold">Date Claimed</th>
                        <th className="px-5 py-3 font-bold">Claimed By</th>
                        <th className="px-5 py-3 font-bold">Status</th>
                        <th className="px-5 py-3 font-bold text-right">Desk Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-gray-900">
                              {item.trackingNumber}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-600">
                            {item.courier}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-600">
                            {item.claimedAt || item.dateArrived}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-semibold text-gray-900">
                            {item.claimedBy || "Resident"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">
                              PICKED UP
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-green-700 text-xs font-bold">
                              ✓ Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile History Stack */}
                <div className="md:hidden divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                  {filteredHistory.map((item) => (
                    <div key={item.id} className="p-4 space-y-2 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-sm text-gray-900 block">
                            {item.trackingNumber}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{item.courier}</span>
                        </div>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                          PICKED UP
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                        <div>
                          <span className="text-gray-400">Date Claimed: </span>
                          <span className="font-medium text-gray-900">{item.claimedAt || item.dateArrived}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Claimed By: </span>
                          <span className="font-bold text-gray-900">{item.claimedBy || "Resident"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
