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

  // Filter parcels for the current user
  const userParcels = parcels.filter(
    (p) => p.residentId === user?.id || (user?.name && p.residentName.toLowerCase() === user.name.toLowerCase())
  );

  const readyParcels = userParcels.filter((p) => p.status === "READY" || p.status === "OVERDUE");
  const historyParcels = userParcels.filter((p) => p.status === "PICKED_UP");

  const freeHoldingDays = user?.plan === "PREMIUM" ? 7 : 3;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
              MY <span className="text-brand-red">PARCELS</span>
            </h1>
          </div>
          <p className="text-sm text-brand-text-secondary mt-1">
            Manage and track all your incoming packages and pickup deadlines in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/track" className="btn btn-outline btn-sm">
            🔍 Track by Number
          </Link>
          {readyParcels.length > 0 && (
            <button
              onClick={() => setSelectedClaimParcel(readyParcels[0])}
              className="btn btn-primary btn-sm font-bold uppercase"
            >
              Show Pickup QR
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-brand-border w-fit shadow-sm text-xs font-bold uppercase">
        {(["ALL", "READY", "HISTORY"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filter === f
                ? "bg-brand-red text-white shadow-sm"
                : "text-brand-text-secondary hover:text-brand-black"
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
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
              {/* Card Header with Green Accent */}
              <div className="bg-[#107C41] text-white px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">✅</span>
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase">
                      READY FOR PICKUP ({readyParcels.length} PARCEL{readyParcels.length === 1 ? "" : "S"})
                    </h2>
                    <p className="text-xs text-white/80">
                      Located at Station 1 • Front Reception Desk
                    </p>
                  </div>
                </div>
                <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full font-bold">
                  Hub Hours: 8 AM - 9 PM
                </span>
              </div>

              {/* Policy Notice */}
              <div className="bg-brand-red-bg px-5 py-2.5 border-b border-brand-red-light/30 flex items-center gap-2 text-xs text-brand-red font-medium">
                <span>⚠️</span>
                <span>
                  Your plan grants {freeHoldingDays} days free holding. Overdue parcels incur ₱10.00/day holding fee after deadline.
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-brand-text-secondary">
                  Loading incoming parcels...
                </div>
              ) : readyParcels.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="text-3xl">📭</div>
                  <p className="text-sm font-bold text-brand-black">No parcels currently awaiting pickup</p>
                  <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
                    When a delivery rider arrives at the condo, your package will be registered here and an SMS notification will be sent.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-brand-surface text-brand-text-secondary text-xs uppercase border-b border-brand-border">
                        <tr>
                          <th className="px-4 py-3">Tracking & Courier</th>
                          <th className="px-4 py-3">Arrival Date</th>
                          <th className="px-4 py-3">Pickup Deadline</th>
                          <th className="px-4 py-3">Holding Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {readyParcels.map((parcel) => (
                          <tr key={parcel.id} className="hover:bg-brand-surface/60 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-brand-black">{parcel.trackingNumber}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{ backgroundColor: parcel.courierColor }}
                                />
                                <span className="text-xs text-brand-text-secondary">{parcel.courier}</span>
                                <span className="text-[10px] bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border text-brand-text-muted">
                                  {parcel.shelf}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-brand-text-secondary">
                              {parcel.dateArrived}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-xs font-semibold ${
                                  parcel.status === "OVERDUE"
                                    ? "text-brand-red font-bold"
                                    : "text-brand-text"
                                }`}
                              >
                                {parcel.deadline}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  parcel.status === "OVERDUE"
                                    ? "bg-brand-red-light text-brand-red"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >
                                {parcel.holdingFee}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => setSelectedClaimParcel(parcel)}
                                className="btn btn-primary btn-sm font-bold uppercase"
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
                  <div className="md:hidden divide-y divide-brand-border">
                    {readyParcels.map((parcel) => (
                      <div key={parcel.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-brand-black">{parcel.trackingNumber}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: parcel.courierColor }}
                              />
                              <span className="text-xs text-brand-text-secondary">{parcel.courier}</span>
                              <span className="text-[10px] bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border">
                                {parcel.shelf}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              parcel.status === "OVERDUE"
                                ? "bg-brand-red-light text-brand-red"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {parcel.holdingFee}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-brand-surface p-2.5 rounded-lg">
                          <div>
                            <span className="text-brand-text-muted block">Arrived:</span>
                            <span className="font-medium text-brand-text">{parcel.dateArrived}</span>
                          </div>
                          <div>
                            <span className="text-brand-text-muted block">Deadline:</span>
                            <span
                              className={`font-medium ${
                                parcel.status === "OVERDUE" ? "text-brand-red font-bold" : "text-brand-text"
                              }`}
                            >
                              {parcel.deadline}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedClaimParcel(parcel)}
                          className="btn btn-primary btn-sm w-full font-bold uppercase"
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
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📜</span>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl tracking-wider uppercase text-brand-black">
                    PARCEL HISTORY & LOGS
                  </h2>
                </div>
                <span className="text-xs text-brand-text-secondary">
                  {historyParcels.length} completed pick-ups
                </span>
              </div>

              {historyParcels.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-text-secondary">
                  No completed pick-ups recorded yet.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-brand-surface text-brand-text-secondary text-xs uppercase border-b border-brand-border">
                        <tr>
                          <th className="px-4 py-3">Tracking Number</th>
                          <th className="px-4 py-3">Courier</th>
                          <th className="px-4 py-3">Date Claimed</th>
                          <th className="px-4 py-3">Claimed By</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {historyParcels.map((item) => (
                          <tr key={item.id} className="hover:bg-brand-surface/60 transition-colors">
                            <td className="px-4 py-3 font-semibold text-brand-black">{item.trackingNumber}</td>
                            <td className="px-4 py-3 text-xs text-brand-text-secondary">{item.courier}</td>
                            <td className="px-4 py-3 text-xs text-brand-text-secondary">{item.claimedAt || item.dateArrived}</td>
                            <td className="px-4 py-3 text-xs font-medium text-brand-text">{item.claimedBy || "Resident"}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                                PICKED UP
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-brand-red text-xs font-semibold">
                                ✓ Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile History Stack */}
                  <div className="md:hidden divide-y divide-brand-border">
                    {historyParcels.map((item) => (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-brand-black">{item.trackingNumber}</span>
                            <p className="text-xs text-brand-text-secondary">{item.courier}</p>
                          </div>
                          <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                            PICKED UP
                          </span>
                        </div>
                        <div className="text-xs text-brand-text-secondary">
                          <span>Claimed: {item.claimedAt || item.dateArrived} by </span>
                          <span className="font-semibold text-brand-text">{item.claimedBy || "Resident"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Rail: Membership Status, Plan Perks, Payment Marks */}
        <div className="space-y-6">
          {/* Membership Status Card (Golden / Cream) */}
          <div className="bg-[#FFFDF4] border-2 border-amber-300/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ACTIVE PLAN
              </span>
              <span className="text-xs text-amber-800 font-bold">Auto-Renews Monthly</span>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-black">
                {user?.plan || "PREMIUM"} <span className="text-brand-red">DROP HUB</span> PLAN
              </h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Full concierge parcel handling with doorstep delivery options.
              </p>
            </div>

            {/* Progress / Quota */}
            <div className="space-y-2 pt-2 border-t border-amber-200">
              <div className="flex justify-between text-xs">
                <span className="text-brand-text-secondary">Holding Period Allowance:</span>
                <span className="font-bold text-green-700">{freeHoldingDays} Days Free</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span className="text-brand-text-secondary">Door Delivery Credits:</span>
                <span className="font-bold text-brand-black">
                  {user?.plan === "PREMIUM" ? "2 of 5 remaining" : "Pay per request"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/membership" className="btn btn-outline btn-sm w-full text-center block">
                UPGRADE / RENEW PLAN
              </Link>
            </div>
          </div>

          {/* Door-to-Door Delivery Request Card */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚪</span>
              <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black">
                REQUEST DOOR DELIVERY
              </h3>
            </div>
            <p className="text-xs text-brand-text-secondary">
              Busy or not at home? Have the reception team deliver your ready parcels directly to {user?.unit || "your unit"}.
            </p>
            <button className="btn btn-primary btn-sm w-full font-bold uppercase">
              SCHEDULE DOOR DELIVERY
            </button>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white border border-brand-border rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-brand-text">
              ACCEPTED PAYMENT METHODS
            </h4>
            <p className="text-xs text-brand-text-secondary">
              Pay holding fees, plan renewals, or extra deliveries seamlessly:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-brand-surface p-2.5 rounded-lg border border-brand-border">
                <span className="font-black text-xs text-blue-600 block">GCash</span>
                <span className="text-[10px] text-brand-text-muted">Instant QR</span>
              </div>
              <div className="bg-brand-surface p-2.5 rounded-lg border border-brand-border">
                <span className="font-black text-xs text-green-600 block">Maya</span>
                <span className="text-[10px] text-brand-text-muted">Instant QR</span>
              </div>
              <div className="bg-brand-surface p-2.5 rounded-lg border border-brand-border">
                <span className="font-black text-xs text-brand-black block">Cash</span>
                <span className="text-[10px] text-brand-text-muted">At Counter</span>
              </div>
            </div>
          </div>

          {/* Need Help Concierge Card */}
          <div className="bg-brand-dark text-white rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📞</span>
              <h4 className="font-[family-name:var(--font-heading)] text-lg">CONCIERGE DESK</h4>
            </div>
            <p className="text-xs text-white/70">
              Have questions about an incoming parcel or misplaced shipment?
            </p>
            <div className="text-xs space-y-1 text-white/90">
              <div>📍 <strong>Location:</strong> Ground Floor Lobby Desk</div>
              <div>🕒 <strong>Hours:</strong> Mon - Sun, 8:00 AM - 9:00 PM</div>
              <div>📱 <strong>Hotline:</strong> 0917 123 4567</div>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Code Modal Popup */}
      {selectedClaimParcel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 bg-brand-red-bg rounded-full flex items-center justify-center mx-auto text-brand-red text-2xl">
              📦
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-black uppercase">
                PARCEL CLAIM CODE
              </h3>
              <p className="text-xs text-brand-text-secondary mt-1">
                Show this verification code to the hub receptionist upon pickup
              </p>
            </div>

            {/* Code Box */}
            <div className="bg-brand-surface p-4 rounded-xl border-2 border-dashed border-brand-red/40">
              <div className="text-xs text-brand-text-muted uppercase tracking-wider font-semibold">
                YOUR UNIQUE PASSCODE
              </div>
              <div className="font-mono text-3xl font-black text-brand-red tracking-widest my-1">
                {selectedClaimParcel.claimCode}
              </div>
              <div className="text-[11px] text-brand-text-secondary">
                Tracking: {selectedClaimParcel.trackingNumber}
              </div>
            </div>

            {/* Synthetic QR Code graphic */}
            <div className="p-3 bg-white border border-brand-border rounded-xl inline-block shadow-inner">
              <div className="w-36 h-36 bg-brand-dark/5 flex flex-col items-center justify-center rounded border border-brand-border/60">
                <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
                  {/* Stylized QR representation */}
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
                <span className="text-[9px] text-brand-text-muted mt-1 uppercase font-semibold">
                  SCAN STATION 1
                </span>
              </div>
            </div>

            <div className="text-xs text-brand-text-secondary">
              Shelf Location: <strong>{selectedClaimParcel.shelf}</strong>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline btn-sm flex-1 font-bold uppercase text-xs"
              >
                🖨️ PRINT PASS
              </button>
              <button
                type="button"
                onClick={() => setSelectedClaimParcel(null)}
                className="btn btn-primary btn-sm flex-1 font-bold uppercase text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
