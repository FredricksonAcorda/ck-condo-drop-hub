"use client";

import React from "react";
import { ResidentProfile, InvoiceRecord } from "@/types";

interface ResidentDetailsModalProps {
  resident: ResidentProfile | null;
  invoices: InvoiceRecord[];
  onClose: () => void;
  onVerify: (resident: ResidentProfile) => Promise<void>;
  onReject: (resident: ResidentProfile) => Promise<void>;
}

export default function ResidentDetailsModal({
  resident,
  onClose,
  onVerify,
  onReject,
}: ResidentDetailsModalProps) {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-red text-white font-bold flex items-center justify-center text-xs">
              {resident.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black uppercase">
                {resident.name}
              </h3>
              <p className="text-xs text-brand-text-secondary font-mono">
                {resident.residentCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-brand-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Branch</span>
            <span className="font-semibold text-brand-black">
              {resident.branch || resident.tower || "Malinta Branch"}
            </span>
          </div>
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Unit / Address</span>
            <span className="font-semibold text-brand-black">{resident.unit}</span>
          </div>
          {(resident.buildingNumber || resident.floorNumber || resident.unitNumber) && (
            <div className="col-span-2 bg-white/70 p-2 rounded-lg border border-brand-border/60 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-text-muted block">Building #</span>
                <span className="font-bold text-brand-black">{resident.buildingNumber || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-text-muted block">Floor #</span>
                <span className="font-bold text-brand-black">{resident.floorNumber || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-brand-text-muted block">Unit #</span>
                <span className="font-bold text-brand-black">{resident.unitNumber || "—"}</span>
              </div>
            </div>
          )}
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Phone</span>
            <span className="text-brand-black font-medium">{resident.phone}</span>
          </div>
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Email</span>
            <span className="text-brand-black font-medium truncate block">{resident.email}</span>
          </div>
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Membership Tier</span>
            <span className="font-bold text-brand-red uppercase">{resident.plan}</span>
          </div>
          <div>
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Plan Status</span>
            <span
              className={`font-bold uppercase ${
                resident.planStatus === "ACTIVE" ? "text-green-700" : "text-amber-700"
              }`}
            >
              {resident.planStatus}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-brand-text-muted block text-[10px] uppercase font-bold mb-1">
              Authorized Proxy Claimants (Up to 3)
            </span>
            {resident.authorizedClaimants && resident.authorizedClaimants.length > 0 ? (
              <div className="space-y-1.5">
                {resident.authorizedClaimants.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-2 rounded-lg border border-brand-border/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-brand-black">{c.name}</span>
                      {c.relationship && (
                        <span className="text-brand-text-secondary ml-1.5 text-[11px]">
                          • {c.relationship}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-gray-600 font-medium">
                      {c.phone || "No Phone"}
                    </span>
                  </div>
                ))}
              </div>
            ) : resident.authorizedClaimant ? (
              <div className="bg-white p-2 rounded-lg border border-brand-border/60 text-xs">
                <span className="font-bold text-brand-black">{resident.authorizedClaimant}</span>
                <span className="font-mono text-[11px] text-gray-600 font-medium ml-2">
                  ({resident.claimantPhone || "No Phone"})
                </span>
              </div>
            ) : (
              <span className="text-brand-text-muted text-xs italic">No proxy claimants registered</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {resident.planStatus === "PENDING_VERIFICATION" || resident.planStatus === "PENDING_PAYMENT" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onVerify(resident)}
                className="btn btn-sm bg-green-700 hover:bg-green-800 text-white font-bold uppercase cursor-pointer shadow-xs"
              >
                Confirm & Activate {resident.pendingPlan || "Premium"} ✓
              </button>
              <button
                type="button"
                onClick={() => onReject(resident)}
                className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-800 font-bold uppercase cursor-pointer"
              >
                Reject
              </button>
            </div>
          ) : (
            <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
              <span>✓</span> Account Verified & Active
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
