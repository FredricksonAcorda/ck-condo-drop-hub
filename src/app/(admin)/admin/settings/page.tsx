"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParcels } from "@/context";
import { HubSettings, EditableFAQ, CommunityAnnouncement } from "@/types";
import { DEFAULT_HUB_SETTINGS } from "@/lib/db/seed-data";
import { PhilippinePhoneInput, GmailInput } from "@/components/ui";

export default function HubSettingsPage() {
  const { hubSettings, updateHubSettings } = useParcels();

  const [formData, setFormData] = useState<HubSettings>({ ...hubSettings });
  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [faqTab, setFaqTab] = useState<"home" | "resident">("home");

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

  const announcements = formData.communityAnnouncements || DEFAULT_HUB_SETTINGS.communityAnnouncements || [];
  const homeFaqs = formData.homeFaqs || DEFAULT_HUB_SETTINGS.homeFaqs || [];
  const residentFaqs = formData.residentFaqs || DEFAULT_HUB_SETTINGS.residentFaqs || [];

  const handleAddAnnouncement = () => {
    const newAnn: CommunityAnnouncement = {
      id: `ann-${Date.now()}`,
      title: "New Announcement",
      highlight: "",
      desc: "",
    };
    setFormData({
      ...formData,
      communityAnnouncements: [...announcements, newAnn],
    });
  };

  const handleUpdateAnnouncement = (id: string, field: keyof CommunityAnnouncement, val: string) => {
    const updated = announcements.map((a) => (a.id === id ? { ...a, [field]: val } : a));
    setFormData({ ...formData, communityAnnouncements: updated });
  };

  const handleRemoveAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    setFormData({ ...formData, communityAnnouncements: updated });
  };

  const handleAddFaq = (target: "home" | "resident") => {
    const newFaq: EditableFAQ = {
      id: `faq-${target}-${Date.now()}`,
      question: "",
      answer: "",
    };
    if (target === "home") {
      setFormData({ ...formData, homeFaqs: [...homeFaqs, newFaq] });
    } else {
      setFormData({ ...formData, residentFaqs: [...residentFaqs, newFaq] });
    }
  };

  const handleUpdateFaq = (target: "home" | "resident", id: string, field: "question" | "answer", val: string) => {
    if (target === "home") {
      const updated = homeFaqs.map((f) => (f.id === id ? { ...f, [field]: val } : f));
      setFormData({ ...formData, homeFaqs: updated });
    } else {
      const updated = residentFaqs.map((f) => (f.id === id ? { ...f, [field]: val } : f));
      setFormData({ ...formData, residentFaqs: updated });
    }
  };

  const handleRemoveFaq = (target: "home" | "resident", id: string) => {
    if (target === "home") {
      const updated = homeFaqs.filter((f) => f.id !== id);
      setFormData({ ...formData, homeFaqs: updated });
    } else {
      const updated = residentFaqs.filter((f) => f.id !== id);
      setFormData({ ...formData, residentFaqs: updated });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            SYSTEM <span className="text-brand-red">SETTINGS</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Configure holding duration allowances, daily overdue rates, website footer contact details, community announcements, and FAQs.
          </p>
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
                    setFormData({ ...formData, freeDaysRegular: parseInt(String(e.target.value).replace(/\D/g, "")) || 3 })
                  }
                  className="input font-bold pr-14 border border-gray-300 bg-white no-spinner"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none select-none">
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
                    setFormData({ ...formData, freeDaysPremium: parseInt(String(e.target.value).replace(/\D/g, "")) || 7 })
                  }
                  className="input font-bold pr-14 border border-gray-300 bg-white no-spinner"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none select-none">
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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-normal text-sm pointer-events-none select-none">
                  ₱
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={typeof formData.overdueFeePerDay === "number" ? formData.overdueFeePerDay : parseInt(String(formData.overdueFeePerDay).replace(/\D/g, "")) || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, overdueFeePerDay: parseInt(String(e.target.value).replace(/\D/g, "")) || 0 })
                  }
                  className="input pl-8 pr-14 font-semibold text-brand-red border border-gray-300 bg-white no-spinner"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted font-bold text-xs pointer-events-none select-none">
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
              Printed on hub receipts, release slips, and public tracking receipts.
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
                Max Lobby Holding Capacity Slots
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.maxShelfSlots}
                onChange={(e) =>
                  setFormData({ ...formData, maxShelfSlots: parseInt(e.target.value) || 60 })
                }
                className="input font-semibold border border-gray-300 bg-white no-spinner"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lobby Operations & Resident Notices */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-bold text-brand-black">Lobby Operations & Resident Notices</h2>
            <p className="text-xs text-brand-text-secondary">
              Customize the pickup counter location, operational schedule, and real-time announcement messages shown to residents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Lobby Pickup Location
              </label>
              <input
                type="text"
                value={formData.pickupLocation || ""}
                onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                placeholder="e.g. Lobby Counter, Ground Floor, Tower A"
                className="input font-semibold border border-gray-300 bg-white"
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Displayed on tracking receipts and resident pickup reminders.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Lobby Operating & Pickup Hours
              </label>
              <input
                type="text"
                value={formData.operatingHours || ""}
                onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                placeholder="e.g. Monday – Sunday: 7:00 AM – 10:00 PM Daily"
                className="input font-semibold border border-gray-300 bg-white"
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Service window for counter claim handoffs and door delivery concierge.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Live Lobby Broadcast Announcement
              </label>
              <textarea
                rows={2}
                value={formData.lobbyAnnouncement || ""}
                onChange={(e) => setFormData({ ...formData, lobbyAnnouncement: e.target.value })}
                placeholder="e.g. Lobby Counter is operating normally. Please present your 4-digit claim code upon pickup."
                className="input font-medium border border-gray-300 bg-white w-full py-2"
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Broadcast banner displayed across resident tracking and membership portals.
              </span>
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
                <span className="font-bold text-brand-black block">Auto-Print Parcel Label on Intake</span>
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

        {/* Section 4: Home Page Footer & Contact Information */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-bold text-brand-black">Home Page Footer & Contact Information</h2>
            <p className="text-xs text-brand-text-secondary">
              Edit the contact details displayed in the website footer on the Home Page and across public portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Contact Phone Number
              </label>
              <PhilippinePhoneInput
                value={formData.contactPhone || ""}
                onChange={(fmt) => setFormData({ ...formData, contactPhone: fmt })}
                placeholder="+63 9XX XXX XXXX"
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Official contact number shown in the website footer.
              </span>
            </div>

            <div>
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Contact Gmail Address
              </label>
              <GmailInput
                value={formData.contactEmail || ""}
                onChange={(full) => setFormData({ ...formData, contactEmail: full })}
                placeholder="ckcondrohub"
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Official support email shown in the website footer.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold uppercase text-brand-text mb-1.5">
                Condominium / Hub Physical Address
              </label>
              <input
                type="text"
                value={formData.contactAddress || ""}
                onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                placeholder="e.g. C1 Buildersville Condominium, Marindal Rincon, Valenzuela City"
                className="input font-semibold border border-gray-300 bg-white w-full"
                required
              />
              <span className="text-[10px] text-brand-text-muted mt-1 block">
                Address displayed on the home page footer and contact section.
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Community Board Announcements (Home Page) */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-border pb-3">
            <div>
              <h2 className="text-base font-bold text-brand-black">Community Board Announcements (Home Page)</h2>
              <p className="text-xs text-brand-text-secondary">
                Add, edit, or remove the announcement cards published on the home page community board.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddAnnouncement}
              className="btn btn-outline text-xs text-brand-red border-brand-red/30 hover:bg-brand-red/10 py-1.5 px-3 rounded-lg font-bold shrink-0 w-auto cursor-pointer"
            >
              + Add Announcement
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann, idx) => (
              <div key={ann.id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                    Announcement Card #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncement(ann.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-brand-text mb-1">
                      Card Title
                    </label>
                    <input
                      type="text"
                      value={ann.title}
                      onChange={(e) => handleUpdateAnnouncement(ann.id, "title", e.target.value)}
                      placeholder="e.g. Store Hours or Promos"
                      className="input font-bold border border-gray-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-brand-text mb-1">
                      Highlight / Badge Text
                    </label>
                    <input
                      type="text"
                      value={ann.highlight || ""}
                      onChange={(e) => handleUpdateAnnouncement(ann.id, "highlight", e.target.value)}
                      placeholder="e.g. 8:00 AM – 9:00 PM or Limited Promo"
                      className="input font-semibold text-brand-red border border-gray-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-brand-text mb-1">
                      Description / Notice Content
                    </label>
                    <textarea
                      rows={2}
                      value={ann.desc}
                      onChange={(e) => handleUpdateAnnouncement(ann.id, "desc", e.target.value)}
                      placeholder="Enter announcement description text displayed to residents..."
                      className="input font-medium border border-gray-300 bg-white w-full py-2"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Frequently Asked Questions (Home Page & Resident Help Center) */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-border pb-3">
            <div>
              <h2 className="text-base font-bold text-brand-black">Frequently Asked Questions (FAQs)</h2>
              <p className="text-xs text-brand-text-secondary">
                Manage FAQs published on the Home Page and the Help Center in resident accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddFaq(faqTab)}
              className="btn btn-outline text-xs text-brand-red border-brand-red/30 hover:bg-brand-red/10 py-1.5 px-3 rounded-lg font-bold shrink-0 w-auto cursor-pointer"
            >
              + Add {faqTab === "home" ? "Home FAQ" : "Resident FAQ"}
            </button>
          </div>

          {/* Subtabs: Home FAQs vs Resident Help Center FAQs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setFaqTab("home")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                faqTab === "home"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Home Page FAQs ({homeFaqs.length})
            </button>
            <button
              type="button"
              onClick={() => setFaqTab("resident")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                faqTab === "resident"
                  ? "border-brand-red text-brand-red"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Resident Help Center FAQs ({residentFaqs.length})
            </button>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {(faqTab === "home" ? homeFaqs : residentFaqs).map((faq, idx) => (
              <div key={faq.id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                    {faqTab === "home" ? "Home" : "Resident"} FAQ #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(faqTab, faq.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold uppercase text-brand-text mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(faqTab, faq.id, "question", e.target.value)}
                      placeholder="e.g. How do I claim my parcel?"
                      className="input font-bold border border-gray-300 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-brand-text mb-1">
                      Answer
                    </label>
                    <textarea
                      rows={3}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(faqTab, faq.id, "answer", e.target.value)}
                      placeholder="Enter detailed answer text..."
                      className="input font-medium border border-gray-300 bg-white w-full py-2"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
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
