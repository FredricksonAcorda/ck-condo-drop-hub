"use client";

import Link from "next/link";
import { useState } from "react";
import { Parcel } from "@/types";
import { useAuth, useParcels } from "@/context";

export default function MyParcelsPage() {
  const { user } = useAuth();
  const { parcels, loading } = useParcels();
  const [selectedClaimParcel, setSelectedClaimParcel] = useState<Parcel | null>(null);
  const [filter, setFilter] = useState<"ALL" | "READY" | "HISTORY">("ALL");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryWindow, setDeliveryWindow] = useState("Evening (6:00 PM - 8:30 PM)");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Filter parcels for current user
  const userParcels = parcels.filter(
    (p) => p.residentId === user?.id || (user?.name && p.residentName.toLowerCase() === user.name.toLowerCase())
  );

  const readyParcels = userParcels.filter((p) => p.status === "READY" || p.status === "OVERDUE");
  const historyParcels = userParcels.filter((p) => p.status === "PICKED_UP");

  const freeHoldingDays = user?.plan === "PREMIUM" ? 7 : 3;

  const handleScheduleDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setShowDeliveryModal(false);
      setDeliverySuccess(`Door delivery scheduled for ${user?.unit || "your unit"} during ${deliveryWindow}!`);
      setTimeout(() => setDeliverySuccess(null), 5000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
            MY <span className="text-brand-red">PARCELS</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all your incoming packages and pickup deadlines in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard?tab=track" className="btn btn-outline btn-sm font-bold uppercase">
            Track by Number
          </Link>
          {readyParcels.length > 0 && (
            <button
              onClick={() => setSelectedClaimParcel(readyParcels[0])}
              className="btn btn-primary btn-sm font-bold uppercase cursor-pointer"
            >
              Show Pickup QR
            </button>
          )}
        </div>
      </div>

      {deliverySuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span>{deliverySuccess}</span>
          <button onClick={() => setDeliverySuccess(null)} className="text-green-600 hover:text-green-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm text-xs font-bold uppercase">
        {(["ALL", "READY", "HISTORY"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filter === f
                ? "bg-brand-red text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {f === "ALL"
              ? `All Parcels (${userParcels.length})`
              : f === "READY"
              ? `Ready for Pickup (${readyParcels.length})`
              : `Past History (${historyParcels.length})`}
          </button>
        ))}
      </div>

      {/* Main Grid: Content + Right Rail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Columns: Ready for Pickup & History */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section 1: Ready for Pickup Card */}
          {filter !== "HISTORY" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="bg-[#107C41] text-white px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase">
                    READY FOR PICKUP ({readyParcels.length} PARCEL{readyParcels.length === 1 ? "" : "S"})
                  </h2>
                  <p className="text-xs text-white/80">
                    Located at Station 1 • Front Reception Desk
                  </p>
                </div>
                <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-bold">
                  Hub Hours: 8 AM - 9 PM
                </span>
              </div>

              {/* Policy Notice */}
              <div className="bg-gray-50 px-5 py-2.5 border-b border-gray-200 flex items-center gap-2 text-xs text-gray-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                <span>
                  Your plan grants {freeHoldingDays} days free holding. Overdue parcels incur ₱10.00/day holding fee after deadline.
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Loading incoming parcels...
                </div>
              ) : readyParcels.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-gray-900">No parcels currently awaiting pickup</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    When a delivery rider arrives at the condo, your package will be registered here and an SMS notification will be sent.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Tracking & Courier</th>
                          <th className="px-4 py-3">Arrival Date</th>
                          <th className="px-4 py-3">Pickup Deadline</th>
                          <th className="px-4 py-3">Holding Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {readyParcels.map((parcel) => (
                          <tr key={parcel.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-gray-900">{parcel.trackingNumber}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{ backgroundColor: parcel.courierColor }}
                                />
                                <span className="text-xs text-gray-500">{parcel.courier}</span>
                                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                  {parcel.shelf}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-500">
                              {parcel.dateArrived}
                            </td>
                            <td className="px-4 py-3.5">
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
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  parcel.status === "OVERDUE"
                                    ? "bg-red-50 text-brand-red border border-red-200"
                                    : "bg-green-50 text-green-700 border border-green-200"
                                }`}
                              >
                                {parcel.holdingFee}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => setSelectedClaimParcel(parcel)}
                                className="btn btn-primary btn-sm font-bold uppercase cursor-pointer"
                              >
                                CLAIM CODE
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Stack */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {readyParcels.map((parcel) => (
                      <div key={parcel.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-gray-900">{parcel.trackingNumber}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: parcel.courierColor }}
                              />
                              <span className="text-xs text-gray-500">{parcel.courier}</span>
                              <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                {parcel.shelf}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              parcel.status === "OVERDUE"
                                ? "bg-red-50 text-brand-red border border-red-200"
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}
                          >
                            {parcel.holdingFee}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <div>
                            <span className="text-gray-500 block">Arrived:</span>
                            <span className="font-medium text-gray-900">{parcel.dateArrived}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Deadline:</span>
                            <span
                              className={`font-medium ${
                                parcel.status === "OVERDUE" ? "text-brand-red font-bold" : "text-gray-900"
                              }`}
                            >
                              {parcel.deadline}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedClaimParcel(parcel)}
                          className="btn btn-primary btn-sm w-full font-bold uppercase cursor-pointer"
                        >
                          VIEW CLAIM CODE & QR
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 2: Parcel History Table */}
          {filter !== "READY" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase text-gray-900">
                  PARCEL HISTORY & LOGS
                </h2>
                <span className="text-xs text-gray-500">
                  {historyParcels.length} completed pick-ups
                </span>
              </div>

              {historyParcels.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  No completed pick-ups recorded yet.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3">Tracking Number</th>
                          <th className="px-4 py-3">Courier</th>
                          <th className="px-4 py-3">Date Claimed</th>
                          <th className="px-4 py-3">Claimed By</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {historyParcels.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900">{item.trackingNumber}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{item.courier}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{item.claimedAt || item.dateArrived}</td>
                            <td className="px-4 py-3 text-xs font-medium text-gray-900">{item.claimedBy || "Resident"}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                                PICKED UP
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-green-700 text-xs font-semibold">
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile History Stack */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {historyParcels.map((item) => (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-gray-900">{item.trackingNumber}</span>
                            <p className="text-xs text-gray-500">{item.courier}</p>
                          </div>
                          <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                            PICKED UP
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span>Claimed: {item.claimedAt || item.dateArrived} by </span>
                          <span className="font-semibold text-gray-900">{item.claimedBy || "Resident"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Rail: Membership Status & Services */}
        <div className="space-y-6">
          {/* Membership Status Card */}
          <div className="bg-[#FFFDF4] border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ACTIVE PLAN
              </span>
              <span className="text-xs text-amber-900 font-bold">Auto-Renews Monthly</span>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900">
                {user?.plan || "PREMIUM"} <span className="text-brand-red">DROP HUB</span> PLAN
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Full concierge parcel handling with doorstep delivery options.
              </p>
            </div>

            {/* Quota */}
            <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Holding Period Allowance:</span>
                <span className="font-bold text-green-700">{freeHoldingDays} Days Free</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-600">Door Delivery Credits:</span>
                <span className="font-bold text-gray-900">
                  {user?.plan === "PREMIUM" ? "2 of 5 remaining" : "Pay per request"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/membership" className="btn btn-outline btn-sm w-full text-center block font-bold uppercase">
                Manage Plan
              </Link>
            </div>
          </div>

          {/* Door-to-Door Delivery Request Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-gray-900 uppercase">
              REQUEST DOOR DELIVERY
            </h3>
            <p className="text-xs text-gray-600">
              Busy or not at home? Have the reception team deliver your ready parcels directly to {user?.unit || "your unit"}.
            </p>
            <button
              type="button"
              onClick={() => setShowDeliveryModal(true)}
              className="btn btn-primary btn-sm w-full font-bold uppercase cursor-pointer"
            >
              SCHEDULE DOOR DELIVERY
            </button>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900">
              ACCEPTED PAYMENT METHODS
            </h4>
            <p className="text-xs text-gray-500">
              Pay holding fees, plan renewals, or extra deliveries seamlessly:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-black text-xs text-blue-600 block">GCash</span>
                <span className="text-[10px] text-gray-500">Instant QR</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-black text-xs text-green-600 block">Maya</span>
                <span className="text-[10px] text-gray-500">Instant QR</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-black text-xs text-gray-900 block">Cash</span>
                <span className="text-[10px] text-gray-500">At Counter</span>
              </div>
            </div>
          </div>

          {/* Concierge Desk Card */}
          <div className="bg-gray-950 text-white rounded-xl p-5 space-y-3">
            <h4 className="font-[family-name:var(--font-heading)] text-lg uppercase">
              CONCIERGE DESK
            </h4>
            <p className="text-xs text-white/70">
              Have questions about an incoming parcel or misplaced shipment?
            </p>
            <div className="text-xs space-y-1.5 text-white/90">
              <div><strong>Location:</strong> Ground Floor Lobby Desk</div>
              <div><strong>Hours:</strong> Mon - Sun, 8:00 AM - 9:00 PM</div>
              <div><strong>Hotline:</strong> 0917 123 4567</div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Code Modal Popup */}
      {selectedClaimParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-gray-900 uppercase">
                PARCEL CLAIM CODE
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Show this verification code to the hub receptionist upon pickup
              </p>
            </div>

            {/* Code Box */}
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

            {/* Synthetic QR Code graphic */}
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

      {/* Schedule Door Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
                  SCHEDULE DOOR DELIVERY
                </h3>
                <p className="text-xs text-gray-500">
                  Deliver ready parcels directly to {user?.unit || "your unit"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliveryModal(false)}
                className="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleDelivery} className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Destination:</span>
                  <span className="font-bold text-gray-900">{user?.unit || "Unit 101"}, {user?.tower || "Tower A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ready Parcels:</span>
                  <span className="font-bold text-brand-red">{readyParcels.length} Package{readyParcels.length === 1 ? "" : "s"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan Allowance:</span>
                  <span className="font-bold text-green-700">
                    {user?.plan === "PREMIUM" ? "Free (Included in VIP)" : "₱35.00 Standard Delivery Fee"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preferred Delivery Window
                </label>
                <select
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  className="input w-full text-xs cursor-pointer"
                  disabled={isScheduling}
                >
                  <option>Morning (10:00 AM - 12:00 PM)</option>
                  <option>Afternoon (2:00 PM - 5:00 PM)</option>
                  <option>Evening (6:00 PM - 8:30 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Delivery Notes / Special Instructions
                </label>
                <textarea
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Please ring doorbell twice, or leave with lobby security..."
                  className="input w-full text-xs"
                  disabled={isScheduling}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="btn btn-outline btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="btn btn-primary btn-sm flex-1 font-bold uppercase text-xs cursor-pointer"
                >
                  {isScheduling ? "Confirming..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
