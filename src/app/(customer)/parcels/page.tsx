"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAuth, useParcels } from "@/context";
import { Parcel } from "@/types";

export default function MyParcelsPage() {
  const { user } = useAuth();
  const { parcels, loading } = useParcels();

  // Primary tab view: ALL, READY, HISTORY
  const [tabFilter, setTabFilter] = useState<"ALL" | "READY" | "HISTORY">("ALL");

  // Filter states for Parcel History & Logs
  const [historyTracking, setHistoryTracking] = useState("");
  const [historyCourier, setHistoryCourier] = useState("ALL");
  const [historyDate, setHistoryDate] = useState(""); // YYYY-MM-DD from calendar
  const [historyClaimedBy, setHistoryClaimedBy] = useState("");
  const [historyStatus, setHistoryStatus] = useState("ALL");
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
    setHistoryPage(1);
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
    return userParcels.filter(
      (p) => p.status === "PICKED_UP" || p.status === "DELIVERED_DOOR" || p.status === "RETURNED"
    );
  }, [userParcels]);

  // Unique couriers present in history
  const availableCouriers = useMemo(() => {
    const set = new Set<string>();
    historyParcels.forEach((p) => {
      if (p.courier) set.add(p.courier);
    });
    ["SPX Express", "J&T Express", "Flash Express", "LBC Express", "2GO Express"].forEach((c) =>
      set.add(c)
    );
    return Array.from(set).sort();
  }, [historyParcels]);

  // Helper to match YYYY-MM-DD from calendar against parcel dates (e.g. "Sept 18, 2026")
  const matchesCalendarDate = (dateStr?: string, calendarYmd?: string): boolean => {
    if (!dateStr || !calendarYmd) return false;
    const parts = calendarYmd.split("-");
    if (parts.length !== 3) return false;

    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const monthNames = [
      ["jan", "01", "1"],
      ["feb", "02", "2"],
      ["mar", "03", "3"],
      ["apr", "04", "4"],
      ["may", "05", "5"],
      ["jun", "06", "6"],
      ["jul", "07", "7"],
      ["aug", "08", "8"],
      ["sep", "sept", "09", "9"],
      ["oct", "10"],
      ["nov", "11"],
      ["dec", "12"],
    ];

    const lower = dateStr.toLowerCase();
    if (!lower.includes(year)) return false;

    const mMatches = monthNames[monthIdx] || [];
    const hasMonth = mMatches.some((m) => lower.includes(m));
    if (!hasMonth) return false;

    const dayRegex = new RegExp(`(^|\\s|0)${day}(,|\\s|•|$)`, "i");
    return dayRegex.test(lower);
  };

  // Helper to extract or display overdue duration
  const getOverdueDaysLabel = (parcel: Parcel): string => {
    if (parcel.status !== "OVERDUE") return "";
    // Check holdingFee e.g. "₱20.00 (2 Days)" or "₱10.00 (1 Day)"
    const match = parcel.holdingFee.match(/(\d+)\s*Day/i);
    if (match) {
      const days = parseInt(match[1], 10);
      return `${days} ${days === 1 ? "Day" : "Days"} Overdue`;
    }
    // Check notes if contains days
    const noteMatch = parcel.notes?.match(/(\d+)\s*Day/i);
    if (noteMatch) {
      const days = parseInt(noteMatch[1], 10);
      return `${days} ${days === 1 ? "Day" : "Days"} Overdue`;
    }
    return "Overdue";
  };

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

      // 3. Date calendar filter (checks claimedAt and dateArrived)
      if (historyDate.trim()) {
        const matchesClaimed = matchesCalendarDate(parcel.claimedAt, historyDate.trim());
        const matchesArrived = matchesCalendarDate(parcel.dateArrived, historyDate.trim());
        if (!matchesClaimed && !matchesArrived) return false;
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

  // Pagination for Parcel History & Logs (Max 5 items per page)
  const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE) || 1;
  const currentHistoryPage = Math.min(Math.max(1, historyPage), totalHistoryPages);
  const historyStartIndex = (currentHistoryPage - 1) * ITEMS_PER_PAGE;
  const historyEndIndex = Math.min(historyStartIndex + ITEMS_PER_PAGE, filteredHistory.length);

  const paginatedHistory = useMemo(() => {
    return filteredHistory.slice(historyStartIndex, historyEndIndex);
  }, [filteredHistory, historyStartIndex, historyEndIndex]);

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
      </div>

      {/* Top Filter Tabs: All, Ready for Pickup, Past History */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm text-xs font-bold uppercase">
        {(["ALL", "READY", "HISTORY"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setTabFilter(tab);
              setHistoryPage(1);
            }}
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
          {/* Card Header (Clean & Minimal) */}
          <div className="bg-[#107C41] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl tracking-wider uppercase">
              READY FOR PICKUP ({readyParcels.length} {readyParcels.length === 1 ? "PARCEL" : "PARCELS"})
            </h2>
          </div>

          {/* Lobby Pickup Guideline (Concise) */}
          <div className="bg-emerald-50 px-5 sm:px-6 py-2.5 border-b border-emerald-100 text-xs text-emerald-950 font-medium">
            Present your <strong>Tracking Number</strong> at the front desk upon collection. Free holding: <strong>{freeHoldingDays} days</strong>.
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
              {/* Desktop Table (Lobby Verification column removed, Shelf removed) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Tracking Number</th>
                      <th className="px-6 py-3.5 font-bold">Courier</th>
                      <th className="px-6 py-3.5 font-bold">Arrival Date and Time</th>
                      <th className="px-6 py-3.5 font-bold">Pickup Deadline</th>
                      <th className="px-6 py-3.5 font-bold text-right">Holding Status</th>
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

                        {/* Courier (Shelf Removed) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: parcel.courierColor }}
                            />
                            <span className="font-semibold text-gray-900 text-xs">{parcel.courier}</span>
                          </div>
                        </td>

                        {/* Arrival Date and Time */}
                        <td className="px-6 py-4 text-xs font-medium text-gray-700">
                          {parcel.dateArrived}
                        </td>

                        {/* Pickup Deadline (With Days Overdue Badge) */}
                        <td className="px-6 py-4">
                          {parcel.status === "OVERDUE" ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-brand-red">
                                {parcel.deadline.replace(/\s*\(overdue\)/i, "")}
                              </span>
                              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-brand-red bg-red-100 border border-red-300 px-2 py-0.5 rounded shadow-2xs">
                                {getOverdueDaysLabel(parcel)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-900">
                                {parcel.deadline}
                              </span>
                              <span className="inline-flex items-center text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                                On Schedule
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Holding Status / Fee */}
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${
                              parcel.status === "OVERDUE"
                                ? "bg-red-50 text-brand-red border border-red-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                          >
                            {parcel.holdingFee}
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
                        <span className="text-gray-500 block text-[11px]">Arrival Date & Time:</span>
                        <span className="font-medium text-gray-900">{parcel.dateArrived}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Pickup Deadline:</span>
                        {parcel.status === "OVERDUE" ? (
                          <div className="space-y-0.5 mt-0.5">
                            <span className="font-bold text-brand-red block">
                              {parcel.deadline.replace(/\s*\(overdue\)/i, "")}
                            </span>
                            <span className="inline-block text-[10px] font-black uppercase text-brand-red bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">
                              {getOverdueDaysLabel(parcel)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-900 block mt-0.5">
                            {parcel.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(parcel.trackingNumber)}
                        className="btn btn-outline btn-sm font-bold uppercase text-xs cursor-pointer"
                      >
                        {copiedTracking === parcel.trackingNumber ? "Copied!" : "Copy Tracking #"}
                      </button>
                      <span className="text-xs text-gray-500">
                        {parcel.status === "OVERDUE" ? "Overdue Holding" : "Free Holding Active"}
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
                {filteredHistory.length} of {historyParcels.length} Records
              </span>
            </div>
          </div>

          {/* 5 Filter Controls: Tracking Number, Courier, Date (Calendar), Claimed By, Status */}
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
                    onChange={(e) => {
                      setHistoryTracking(e.target.value);
                      setHistoryPage(1);
                    }}
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
                    onChange={(e) => {
                      setHistoryCourier(e.target.value);
                      setHistoryPage(1);
                    }}
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

                {/* 3. Filter by Date (Calendar Selection) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Date (Calendar)
                  </label>
                  <input
                    type="date"
                    value={historyDate}
                    onChange={(e) => {
                      setHistoryDate(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="input w-full text-xs cursor-pointer bg-white"
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
                    onChange={(e) => {
                      setHistoryClaimedBy(e.target.value);
                      setHistoryPage(1);
                    }}
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
                    onChange={(e) => {
                      setHistoryStatus(e.target.value);
                      setHistoryPage(1);
                    }}
                    className="input w-full text-xs cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PICKED_UP">Picked Up (Counter)</option>
                    <option value="DELIVERED_DOOR">Delivered to Unit</option>
                    <option value="RETURNED">Returned to Courier</option>
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
                  Try adjusting the tracking number, courier, calendar date, or claimant search terms.
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
                        <th className="px-5 py-3 font-bold text-right">
                          Desk Verification
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedHistory.map((item) => (
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
                            {item.status === "DELIVERED_DOOR" ? (
                              <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                                DOOR DELIVERED
                              </span>
                            ) : item.status === "RETURNED" ? (
                              <span className="text-[11px] bg-gray-100 text-gray-800 font-bold px-2.5 py-0.5 rounded-full">
                                RETURNED
                              </span>
                            ) : (
                              <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">
                                PICKED UP
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full inline-block">
                              ✓ VERIFIED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile History Stack */}
                <div className="md:hidden divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                  {paginatedHistory.map((item) => (
                    <div key={item.id} className="p-4 space-y-2 bg-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-sm text-gray-900 block">
                            {item.trackingNumber}
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">{item.courier}</span>
                        </div>
                        {item.status === "DELIVERED_DOOR" ? (
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                            DOOR DELIVERED
                          </span>
                        ) : item.status === "RETURNED" ? (
                          <span className="text-[10px] bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded-full">
                            RETURNED
                          </span>
                        ) : (
                          <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full">
                            PICKED UP
                          </span>
                        )}
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
                        <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                          <span className="text-gray-400 text-[11px]">Desk Handover:</span>
                          <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full inline-block">
                            ✓ VERIFIED
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls Footer (Max 5 parcels per view, with Next button) */}
                {filteredHistory.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 mt-4">
                    <div className="text-xs text-gray-600 font-medium text-center sm:text-left">
                      Showing{" "}
                      <span className="font-bold text-gray-900">
                        {filteredHistory.length === 0 ? 0 : historyStartIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-gray-900">{historyEndIndex}</span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-900">{filteredHistory.length}</span>{" "}
                      records
                      {totalHistoryPages > 1 && (
                        <span className="ml-1 text-gray-500 font-semibold">
                          (Page {currentHistoryPage} of {totalHistoryPages})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={currentHistoryPage <= 1}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          currentHistoryPage <= 1
                            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                        }`}
                        title="Previous page"
                      >
                        ← Prev
                      </button>

                      {/* Numbered Page Buttons */}
                      {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setHistoryPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentHistoryPage === pageNum
                              ? "bg-brand-red text-white shadow-sm font-black"
                              : "border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-black bg-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      {/* Next Page Button */}
                      <button
                        type="button"
                        onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                        disabled={currentHistoryPage >= totalHistoryPages}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          currentHistoryPage >= totalHistoryPages
                            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                            : "bg-brand-red text-white border-brand-red hover:bg-red-700 font-black shadow-xs"
                        }`}
                        title="Next page"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
