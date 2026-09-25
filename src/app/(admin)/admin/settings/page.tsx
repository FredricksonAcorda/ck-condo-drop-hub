"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParcels } from "@/context";
import { HubSettings } from "@/types";
import { DEFAULT_HUB_SETTINGS } from "@/lib/db/seed-data";

export default function HubSettingsPage() {
  const { hubSettings, updateHubSettings } = useParcels();

  const [formData, setFormData] = useState<HubSettings>({ ...hubSettings });
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setFormData({ ...hubSettings });
  }, [hubSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateHubSettings(formData);
      setSaveAlert("✓ Hub policies and station settings updated successfully!");
      setTimeout(() => setSaveAlert(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm("Reset all hub policies and fees to factory defaults?")) {
      setFormData({ ...DEFAULT_HUB_SETTINGS });
      await updateHubSettings({ ...DEFAULT_HUB_SETTINGS });
      setSaveAlert("Reset to standard building defaults.");
      setTimeout(() => setSaveAlert(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            HUB POLICIES & <span className="text-brand-red">SETTINGS</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Configure holding duration allowances, daily overdue rates, thermal printer options, and hardware chimes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Station Admin
          </Link>
        </div>
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <div className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{saveAlert}</span>
          <button
            onClick={() => setSaveAlert(null)}
            className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 bg-black/20 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Holding Days & Fees */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-bold text-brand-black">Holding Duration & Overdue Fee Policies</h2>
            <p className="text-xs text-brand-text-secondary">
              Determines how long packages are stored before daily holding penalties begin accruing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Regular Plan Free Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formData.freeDaysRegular}
                  onChange={(e) =>
                    setFormData({ ...formData, freeDaysRegular: parseInt(e.target.value) || 3 })
                  }
                  className="input font-bold pr-14 border border-gray-300 bg-white"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none">
                  days
                </span>
              </div>
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Standard allowance for basic condo units.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Premium Plan Free Days
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.freeDaysPremium}
                  onChange={(e) =>
                    setFormData({ ...formData, freeDaysPremium: parseInt(e.target.value) || 7 })
                  }
                  className="input font-bold pr-14 border border-gray-300 bg-white"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none">
                  days
                </span>
              </div>
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Extended holding for subscribers.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Overdue Rate Per Day
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text font-bold text-sm pointer-events-none">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.overdueFeePerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, overdueFeePerDay: parseInt(e.target.value) || 20 })
                  }
                  className="input pl-8 pr-14 font-bold text-brand-red border border-gray-300 bg-white"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none">
                  /day
                </span>
              </div>
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Charged upon handoff if overdue.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Hub Station & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-bold text-brand-black">Station & Building Information</h2>
            <p className="text-xs text-brand-text-secondary">
              Printed on thermal shelf labels, release slips, and public tracking receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Hub Platform Name
              </label>
              <input
                type="text"
                value={formData.hubName}
                onChange={(e) => setFormData({ ...formData, hubName: e.target.value })}
                className="input font-semibold border border-gray-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Building / Condominium Property
              </label>
              <input
                type="text"
                value={formData.buildingName}
                onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                className="input font-semibold border border-gray-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Active Station Name
              </label>
              <input
                type="text"
                value={formData.stationName}
                onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                className="input font-semibold border border-gray-300 bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Max Shelf Capacity Slots
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.maxShelfSlots}
                onChange={(e) =>
                  setFormData({ ...formData, maxShelfSlots: parseInt(e.target.value) || 60 })
                }
                className="input font-semibold border border-gray-300 bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Hardware & Terminal Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-bold text-brand-black">Hardware & Gateway Preferences</h2>
            <p className="text-xs text-brand-text-secondary">
              Control scanner audio feedback, printer auto-trigger, and SMS sender branding.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-border">
              <div>
                <span className="font-bold text-brand-black block">Scanner Audio Feedback (Web Audio Synthesizer)</span>
                <span className="text-[11px] text-brand-text-secondary">
                  Plays audible two-tone chime upon successful barcode and QR scans.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-brand-red cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-brand-surface rounded-xl border border-brand-border">
              <div>
                <span className="font-bold text-brand-black block">Auto-Print Shelf Label on Intake</span>
                <span className="text-[11px] text-brand-text-secondary">
                  Automatically triggers browser print dialogue for thermal 58mm × 40mm sticker on parcel log.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoPrintIntakeLabel}
                onChange={(e) => setFormData({ ...formData, autoPrintIntakeLabel: e.target.checked })}
                className="w-5 h-5 accent-brand-red cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                SMS Masking Sender ID
              </label>
              <input
                type="text"
                maxLength={11}
                value={formData.smsSenderId}
                onChange={(e) => setFormData({ ...formData, smsSenderId: e.target.value.toUpperCase() })}
                className="input font-mono uppercase font-bold max-w-xs border border-gray-300 bg-white"
                required
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Up to 11 alphanumeric characters registered with telco providers (Semaphore / Twilio).
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline text-xs text-brand-text-muted hover:text-brand-red w-full sm:w-auto"
          >
            Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary px-8 py-3 text-sm font-bold uppercase tracking-wider w-full sm:w-auto shadow-md"
          >
            {saving ? "SAVING..." : "SAVE SETTINGS & POLICIES"}
          </button>
        </div>
      </form>
    </div>
  );
}
