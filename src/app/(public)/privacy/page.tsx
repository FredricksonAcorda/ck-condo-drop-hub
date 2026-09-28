import React from "react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CK Condo Drop Hub",
  description: "Privacy Policy and Republic Act 10173 compliance details for CK Condo Drop Hub at Buildersville Condominium.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-brand-surface py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red block mb-1">
              Data Privacy Act (RA 10173) Compliance
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl text-gray-900 uppercase font-black tracking-tight">
              PRIVACY POLICY
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              CK Condo Drop Hub • Buildersville Condominium Community Platform • Effective September 2026
            </p>
          </div>

          {/* Quick switcher link to Terms */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-600">Looking for our package holding rules?</span>
            <Link href="/terms" className="text-brand-red font-bold hover:underline">
              Read Terms of Service →
            </Link>
          </div>

          {/* Document Content */}
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                1. Statutory Compliance (Republic Act No. 10173)
              </h2>
              <p>
                CK Condo Drop Hub is fully committed to upholding resident privacy rights in accordance with Republic Act No. 10173, otherwise known as the Data Privacy Act of 2012 (DPA) of the Philippines, and its Implementing Rules and Regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                2. Personal Data We Collect
              </h2>
              <p>
                To provide seamless parcel intake, identity verification, and notifications, we collect the following information during account creation and hub usage:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                <li>Resident Full Name and contact information</li>
                <li>Philippine Mobile Telephone Number (+63 9XX XXX XXXX)</li>
                <li>Registered Gmail Address</li>
                <li>Buildersville Condominium location (Branch, Building #, Floor #, Unit #)</li>
                <li>Full names and mobile numbers of up to 3 Authorized Proxy Claimants</li>
                <li>Courier tracking numbers, delivery timestamps, and pickup verification logs</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                3. Purpose of Data Processing
              </h2>
              <p>
                Your personal data is strictly processed for legitimate operational purposes:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                <li>Dispatching automated SMS arrival and holding reminders</li>
                <li>Verifying claimant identity and preventing parcel loss or misdelivery</li>
                <li>Routing door-to-door concierge deliveries to the correct condo unit</li>
                <li>Processing lobby counter receipts and subscription renewal verification</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                4. Data Security & Third-Party Non-Disclosure
              </h2>
              <p>
                We employ rigorous technical, organizational, and physical safeguards:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-gray-600">
                <li>Passwords are encrypted and stored via secure Firebase Authentication infrastructure.</li>
                <li>
                  <strong className="text-gray-900">Strict Non-Disclosure:</strong> We never sell, rent, commercialize, or share resident personal information with external advertisers or telemarketers.
                </li>
                <li>
                  Access to parcel release logs is strictly limited to authorized Lobby Staff Admin personnel on duty.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                5. Resident Rights & Data Retention
              </h2>
              <p>
                Under the Philippine Data Privacy Act, residents retain the right to access, rectify, or request deletion of their personal information. Upon moving out of Buildersville Condominium, residents may request account deactivation and removal of registered proxy lists by contacting the Lobby Staff Admin or sending an email to our desk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-bold text-gray-900 text-base uppercase">
                6. Contact Our Data Protection Desk
              </h2>
              <p>
                For privacy inquiries, rights enforcement, or questions regarding personal data handling, contact us at:
              </p>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1 mt-2">
                <p>
                  <strong className="text-gray-900">Email:</strong> ckcondohub@gmail.com
                </p>
                <p>
                  <strong className="text-gray-900">Lobby Desk:</strong> Ground Floor Main Lobby, Buildersville Condominium
                </p>
                <p>
                  <strong className="text-gray-900">Hotline:</strong> 0917 123 4567
                </p>
              </div>
            </section>
          </div>

          {/* Footer Back link */}
          <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 font-semibold">
              ← Back to Home
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
