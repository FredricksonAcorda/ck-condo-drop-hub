import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CK Condo Drop Hub",
  description: "Terms of Service and package holding regulations for CK Condo Drop Hub at Buildersville Condominium.",
};

export default function TermsPage() {
  return (
    <div className="bg-brand-surface py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red block mb-1">
              Community Agreement
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-gray-900 uppercase font-black tracking-tight">
              TERMS OF SERVICE
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              CK Condo Drop Hub • Buildersville Condominium Community Platform • Effective September 2026
            </p>
          </div>

          {/* Quick switcher link to Privacy Policy */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-600">Looking for our data privacy information?</span>
            <Link href="/privacy" className="text-brand-red font-bold hover:underline">
              Read Privacy Policy
            </Link>
          </div>

          {/* Document Content */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                1. Acceptance of Community Agreement
              </h2>
              <p>
                By creating an account, registering your unit, or utilizing the package holding facility at CK Condo Drop Hub (Buildersville Condominium), you explicitly agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use the parcel drop, holding, and doorstep delivery services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                2. Hub Scope & Storefront Operations
              </h2>
              <p>
                CK Condo Drop Hub serves as the centralized intake, staging, and verification center for all resident deliveries arriving via courier partners (including SPX Express, Flash Express, J&T Express, YTO Express, LBC Express, STO Express, and other official delivery vendors). Operating storefront hours are daily from 8:00 AM to 9:00 PM at the Ground Floor Lobby Drop Counter.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                3. Free Holding Periods & Overdue Storage
              </h2>
              <p>
                Every parcel scanned into the hub is tagged with a digital timestamp and allocated free storage holding days according to the resident&apos;s active plan:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                <li>
                  <strong className="text-gray-900">Per-Parcel & Regular Plans:</strong> Three (3) calendar days of complimentary shelf storage from time of intake.
                </li>
                <li>
                  <strong className="text-gray-900">Premium VIP Plan:</strong> Seven (7) calendar days of complimentary shelf storage from time of intake.
                </li>
                <li>
                  <strong className="text-gray-900">Overdue Holding Fees:</strong> Parcels remaining unclaimed beyond the free holding window accrue storage fees of ₱10.00 per calendar day. Overdue balances must be settled at the Lobby counter prior to package release.
                </li>
                <li>
                  <strong className="text-gray-900">Unclaimed Packages:</strong> Items left unclaimed for more than thirty (30) days without prior written notice to Lobby Staff Admin will be escalated to Condominium Property Administration for safekeeping or return-to-sender disposition.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                4. Parcel Verification & Authorized Proxy Claimants
              </h2>
              <p>
                To protect residents from package theft, parcel handover requires presentation of the four-character digital passcode (e.g., CK-8921) or resident QR pass.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                <li>
                  Residents may register up to three (3) Authorized Proxy Claimants (such as spouses, relatives, or household assistants) via their Resident Account portal.
                </li>
                <li>
                  Proxy claimants must present a valid government-issued ID or resident condominium identification along with the claim passcode upon pickup.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                5. Doorstep Delivery Regulations (Premium VIP)
              </h2>
              <p>
                Door-to-door delivery is exclusive to active Premium VIP members (capped at one free delivery run per monthly billing cycle). Delivery dispatches occur strictly during operational lobby hours, and an authorized claimant must be present inside the designated condominium unit to receive and acknowledge the handover.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                6. Prohibited & Hazardous Goods
              </h2>
              <p>
                The hub strictly prohibits the acceptance or storage of: illegal drugs, firearms, hazardous or flammable chemicals, raw perishable meat or live animals, and oversized freight exceeding locker storage clearance. Staff Admin reserves the right to reject delivery of hazardous items.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                7. Limitation of Liability
              </h2>
              <p>
                CK Condo Drop Hub exercises high standards of diligence and physical surveillance. However, the hub is not liable for manufacturing defects, merchant fulfillment inaccuracies, or internal packaging damage caused prior to courier delivery intake. External package damage noticed upon courier delivery is documented immediately by staff during parcel intake scanning.
              </p>
            </section>
          </div>

          {/* Footer Back link */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
              Back to Home
            </Link>
            <Link href="/register" className="btn btn-primary py-2 px-5 text-xs font-bold uppercase">
              REGISTER ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
