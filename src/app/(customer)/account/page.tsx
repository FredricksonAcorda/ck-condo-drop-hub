"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context";

export default function MyAccountPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"details" | "password" | "notifications" | "delivery">("details");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.name || "Juan Dela Cruz");
  const [email, setEmail] = useState(user?.email || "juan.delacruz@example.com");
  const [phone, setPhone] = useState(user?.phone || "0917 123 4567");
  const [unit, setUnit] = useState(user?.unit || "Unit 101");
  const [tower, setTower] = useState(user?.tower || "Tower A");
  const building = "CK Buildersville Condominium";
  const [authorizedClaimant, setAuthorizedClaimant] = useState("Maria Dela Cruz (Spouse)");
  const [claimantPhone, setClaimantPhone] = useState("0918 987 6543");

  // Notifications
  const [smsArrival, setSmsArrival] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [promoUpdates, setPromoUpdates] = useState(false);

  // Door delivery preferences
  const [preferredWindow, setPreferredWindow] = useState("Morning (10:00 AM - 12:00 PM)");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    "Please ring doorbell and place parcels on the shoe rack outside the unit if no response."
  );

  // Synchronize when active user changes (e.g. via demo switcher)
  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      if (user.unit) setUnit(user.unit);
      if (user.tower) setTower(user.tower);
    }
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        unit: unit.trim(),
        tower: tower.trim(),
        authorizedClaimant: authorizedClaimant.trim(),
        claimantPhone: claimantPhone.trim(),
        preferredDeliveryWindow: preferredWindow,
        deliveryInstructions: deliveryInstructions.trim(),
        notifications: {
          smsArrival,
          smsReminder,
          emailDigest,
          promoUpdates,
        },
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-gray-900 uppercase tracking-wide">
            MY <span className="text-brand-red">ACCOUNT</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your resident credentials, contact information, and delivery preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-bold border border-green-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Verified Resident
          </span>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm animate-in fade-in">
          <span className="font-medium">
            Profile changes saved successfully to database!
          </span>
          <button onClick={() => setSavedSuccess(false)} className="text-green-600 hover:text-green-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm animate-in fade-in">
          <span className="font-medium">
            {saveError}
          </span>
          <button onClick={() => setSaveError(null)} className="text-red-600 hover:text-red-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
              {[
                { id: "details", label: "Account Details" },
                { id: "password", label: "Change Password" },
                { id: "notifications", label: "Notifications" },
                { id: "delivery", label: "Door Delivery" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-5 py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "border-brand-red text-brand-red bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Account Details */}
            {activeTab === "details" && (
              <form onSubmit={handleSave} className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mobile Phone (for SMS pickup alerts)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">
                    Condominium Unit Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unit Number
                      </label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tower / Cluster
                      </label>
                      <input
                        type="text"
                        value={tower}
                        onChange={(e) => setTower(e.target.value)}
                        className="input w-full"
                        required
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Resident Code
                      </label>
                      <input
                        type="text"
                        value={user?.residentCode || "CK-000123"}
                        disabled
                        className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed font-mono"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Condominium Property
                      </label>
                      <input
                        type="text"
                        value={building}
                        disabled
                        className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-1">
                    Authorized Parcel Claimants
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Allow family members or housemates to claim parcels on your behalf with their ID.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Authorized Person & Relationship
                      </label>
                      <input
                        type="text"
                        value={authorizedClaimant}
                        onChange={(e) => setAuthorizedClaimant(e.target.value)}
                        className="input w-full"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Claimant Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={claimantPhone}
                        onChange={(e) => setClaimantPhone(e.target.value)}
                        className="input w-full"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn btn-primary btn-sm font-bold uppercase cursor-pointer"
                  >
                    {isSaving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Change Password */}
            {activeTab === "password" && (
              <form onSubmit={handleSave} className="p-6 space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input type="password" placeholder="••••••••" className="input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password
                  </label>
                  <input type="password" placeholder="At least 8 characters" className="input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input type="password" placeholder="Repeat new password" className="input w-full" required />
                </div>
                <div className="pt-3">
                  <button type="submit" disabled={isSaving} className="btn btn-primary btn-sm font-bold uppercase cursor-pointer">
                    Update Password
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-600 space-y-1 mt-4">
                  <span className="font-bold text-gray-900 block">Forgot your current password?</span>
                  <p className="leading-relaxed">
                    If you don't remember your current password,{" "}
                    <Link href="/forgot-password" className="text-brand-red font-bold hover:underline">
                      Click here
                    </Link>{" "}
                    to request a secure recovery code via SMS/Email, or visit the <strong>Station 1 Front Desk</strong> with a valid resident ID for instant staff assistance.
                  </p>
                </div>
              </form>
            )}

            {/* Tab 3: Notifications */}
            {activeTab === "notifications" && (
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  {[
                    {
                      title: "SMS Parcel Arrival Alert",
                      desc: "Instant text message whenever a courier drops off a parcel for your unit.",
                      checked: smsArrival,
                      setter: setSmsArrival,
                    },
                    {
                      title: "Pickup Deadline Reminder",
                      desc: "Alert 24 hours before the free holding period expires to avoid fees.",
                      checked: smsReminder,
                      setter: setSmsReminder,
                    },
                    {
                      title: "Weekly Email Digest",
                      desc: "Summary of all claimed and delivered packages over the past 7 days.",
                      checked: emailDigest,
                      setter: setEmailDigest,
                    },
                    {
                      title: "Hub Announcements & Promos",
                      desc: "Updates on holiday operating hours, plan discounts, and courier promos.",
                      checked: promoUpdates,
                      setter: setPromoUpdates,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-sm font-bold uppercase cursor-pointer">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Door Delivery */}
            {activeTab === "delivery" && (
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-sm text-gray-900 mb-1">
                    DOORSTEP CONCIERGE PREFERENCES
                  </h4>
                  <p className="text-xs text-gray-500">
                    Configure instructions for hub runners when bringing parcels to your front door.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Plan Quota Badge */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-950 block text-sm">
                        {user?.plan === "PREMIUM" ? "Premium Concierge Benefit" : "Concierge Runner Service"}
                      </span>
                      <span className="text-amber-800 text-xs">
                        {user?.plan === "PREMIUM"
                          ? `Includes 5 free concierge door deliveries per month. You have ${user?.deliveryCreditsLeft ?? 0} free runs remaining.`
                          : "Your Regular plan has 0 free deliveries. Concierge doorstep delivery is available at pay-per-trip rates."}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 shadow-2xs">
                        {user?.plan === "PREMIUM"
                          ? `${user?.deliveryCreditsLeft ?? 0} of 5 Left`
                          : "0 Free (Pay-Per-Trip)"}
                      </span>
                      {user?.plan !== "PREMIUM" && (
                        <Link
                          href="/membership"
                          className="text-xs font-bold text-brand-red hover:underline whitespace-nowrap"
                        >
                          Upgrade Plan →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Preferred Delivery Window
                    </label>
                    <select
                      value={preferredWindow}
                      onChange={(e) => setPreferredWindow(e.target.value)}
                      className="input w-full cursor-pointer"
                    >
                      <option>Morning (10:00 AM - 12:00 PM)</option>
                      <option>Afternoon (2:00 PM - 5:00 PM)</option>
                      <option>Evening (6:00 PM - 8:30 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Drop-off Instructions (Saved for Concierge Runners)
                    </label>
                    <textarea
                      rows={3}
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Please ring doorbell and place parcels on the shoe rack outside the unit..."
                      className="input w-full"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-sm font-bold uppercase cursor-pointer">
                    Save Delivery Instructions
                  </button>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
