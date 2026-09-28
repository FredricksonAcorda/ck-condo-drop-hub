"use client";

import React, { useState, useEffect } from "react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = "terms",
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-[#141418] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-left overflow-hidden zoom-in-95">
        {/* Top Red Rim Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl text-white uppercase font-bold tracking-tight">
              {activeTab === "terms" ? "TERMS OF SERVICE" : "PRIVACY POLICY"}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              CK Condo Drop Hub • Buildersville Condominium Community Platform
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-lg leading-none transition-colors"
            aria-label="Close legal modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher - Strictly text-only, zero icons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === "terms"
                ? "bg-brand-red text-white border-brand-red shadow-sm"
                : "bg-[#1c1c22] text-zinc-400 hover:text-white border-zinc-800"
            }`}
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
              activeTab === "privacy"
                ? "bg-brand-red text-white border-brand-red shadow-sm"
                : "bg-[#1c1c22] text-zinc-400 hover:text-white border-zinc-800"
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-4 text-xs sm:text-[13px] text-zinc-300 leading-relaxed divide-y divide-zinc-800/80">
          {activeTab === "terms" ? (
            /* ================= TERMS OF SERVICE ================= */
            <div className="space-y-4 pt-1">
              <div>
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  1. Acceptance of Community Agreement
                </h4>
                <p className="mt-1 text-zinc-400">
                  By creating an account, registering your unit, or utilizing the package holding facility at CK Condo Drop Hub (Buildersville Condominium), you explicitly agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use the parcel drop, holding, and doorstep delivery services.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  2. Hub Scope & Storefront Operations
                </h4>
                <p className="mt-1 text-zinc-400">
                  CK Condo Drop Hub serves as the centralized intake, staging, and verification center for all resident deliveries arriving via courier partners (including SPX Express, Flash Express, J&T Express, YTO Express, LBC Express, STO Express, and other official delivery vendors). Operating storefront hours are daily from 8:00 AM to 9:00 PM at the Ground Floor Lobby Drop Counter.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  3. Free Holding Periods & Overdue Storage
                </h4>
                <p className="mt-1 text-zinc-400">
                  Every parcel scanned into the hub is tagged with a digital timestamp and allocated free storage holding days according to the resident&apos;s active plan:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 pl-1">
                  <li>
                    <strong className="text-zinc-200">Per-Parcel & Regular Plans:</strong> Three (3) calendar days of complimentary shelf storage from time of intake.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Premium VIP Plan:</strong> Seven (7) calendar days of complimentary shelf storage from time of intake.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Overdue Holding Fees:</strong> Parcels remaining unclaimed beyond the free holding window accrue storage fees of ₱10.00 per calendar day. Overdue balances must be settled at the Lobby counter prior to package release.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Unclaimed Packages:</strong> Items left unclaimed for more than thirty (30) days without prior written notice to Lobby Staff Admin will be escalated to Condominium Property Administration for safekeeping or return-to-sender disposition.
                  </li>
                </ul>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  4. Parcel Verification & Authorized Proxy Claimants
                </h4>
                <p className="mt-1 text-zinc-400">
                  To protect residents from package theft, parcel handover requires presentation of the four-character digital passcode (e.g., CK-8921) or resident QR pass.
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 pl-1">
                  <li>
                    Residents may register up to three (3) Authorized Proxy Claimants (such as spouses, relatives, or household assistants) via their Resident Account portal.
                  </li>
                  <li>
                    Proxy claimants must present a valid government-issued ID or resident condominium identification along with the claim passcode upon pickup.
                  </li>
                </ul>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  5. Doorstep Delivery Regulations (Premium VIP)
                </h4>
                <p className="mt-1 text-zinc-400">
                  Door-to-door delivery is exclusive to active Premium VIP members (capped at one free delivery run per monthly billing cycle). Delivery dispatches occur strictly during operational lobby hours, and an authorized claimant must be present inside the designated condominium unit to receive and acknowledge the handover.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  6. Prohibited & Hazardous Goods
                </h4>
                <p className="mt-1 text-zinc-400">
                  The hub strictly prohibits the acceptance or storage of: illegal drugs, firearms, hazardous or flammable chemicals, raw perishable meat or live animals, and oversized freight exceeding locker storage clearance. Staff Admin reserves the right to reject delivery of hazardous items.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  7. Limitation of Liability
                </h4>
                <p className="mt-1 text-zinc-400">
                  CK Condo Drop Hub exercises high standards of diligence and physical surveillance. However, the hub is not liable for manufacturing defects, merchant fulfillment inaccuracies, or internal packaging damage caused prior to courier delivery intake. External package damage noticed upon courier delivery is documented immediately by staff during parcel intake scanning.
                </p>
              </div>
            </div>
          ) : (
            /* ================= PRIVACY POLICY ================= */
            <div className="space-y-4 pt-1">
              <div>
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  1. Statutory Compliance (Republic Act No. 10173)
                </h4>
                <p className="mt-1 text-zinc-400">
                  CK Condo Drop Hub is fully committed to upholding resident privacy rights in accordance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA) of the Philippines, and its Implementing Rules and Regulations.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  2. Personal Data We Collect
                </h4>
                <p className="mt-1 text-zinc-400">
                  To provide seamless parcel intake, identity verification, and notifications, we collect the following information during account creation and hub usage:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 pl-1">
                  <li>Resident Full Name and contact information</li>
                  <li>Philippine Mobile Telephone Number (+63 9XX XXX XXXX)</li>
                  <li>Registered Gmail Address</li>
                  <li>Buildersville Condominium location (Branch, Building #, Floor #, Unit #)</li>
                  <li>Full names and mobile numbers of up to 3 Authorized Proxy Claimants</li>
                  <li>Courier tracking numbers, delivery timestamps, and pickup verification logs</li>
                </ul>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  3. Purpose of Data Processing
                </h4>
                <p className="mt-1 text-zinc-400">
                  Your personal data is strictly processed for legitimate operational purposes:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 pl-1">
                  <li>Dispatching automated SMS arrival and holding reminders</li>
                  <li>Verifying claimant identity and preventing parcel loss or misdelivery</li>
                  <li>Routing door-to-door concierge deliveries to the correct condo unit</li>
                  <li>Processing lobby counter receipts and subscription renewal verification</li>
                </ul>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  4. Data Security & Third-Party Non-Disclosure
                </h4>
                <p className="mt-1 text-zinc-400">
                  We employ rigorous technical, organizational, and physical safeguards:
                </p>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-zinc-400 pl-1">
                  <li>Passwords are encrypted and stored via secure Firebase Authentication infrastructure.</li>
                  <li>
                    <strong className="text-zinc-200">Strict Non-Disclosure:</strong> We never sell, rent, commercialize, or share resident personal information with external advertisers or telemarketers.
                  </li>
                  <li>
                    Access to parcel release logs is strictly limited to authorized Lobby Staff Admin personnel on duty.
                  </li>
                </ul>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  5. Resident Rights & Data Retention
                </h4>
                <p className="mt-1 text-zinc-400">
                  Under the Philippine Data Privacy Act, residents retain the right to access, rectify, or request deletion of their personal information. Upon moving out of Buildersville Condominium, residents may request account deactivation and removal of registered proxy lists by contacting the Lobby Staff Admin or sending an email to our desk.
                </p>
              </div>

              <div className="pt-3">
                <h4 className="font-bold text-white text-sm uppercase text-zinc-100">
                  6. Contact Our Data Desk
                </h4>
                <p className="mt-1 text-zinc-400">
                  For privacy inquiries, rights enforcement, or questions regarding personal data handling, contact us at:
                  <br />
                  <strong className="text-zinc-200">Email:</strong> ckcondohub@gmail.com
                  <br />
                  <strong className="text-zinc-200">Lobby Desk:</strong> Ground Floor Main Lobby, Buildersville Condominium
                  <br />
                  <strong className="text-zinc-200">Hotline:</strong> 0917 123 4567
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500">
            Effective as of September 2026 • Buildersville Condominium Drop Hub
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer text-center"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
