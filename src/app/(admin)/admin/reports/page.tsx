"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useParcels } from "@/context";
import { ActivityType } from "@/types";

export default function ReportsAndLogsPage() {
  const { activityLogs, smsLogs, sendTestSms, hubSettings } = useParcels();

  // Tab State
  const [activeTab, setActiveTab] = useState<"ACTIVITY" | "SMS_QUEUE">("ACTIVITY");

  // Activity Filter
  const [activityFilter, setActivityFilter] = useState<"ALL" | ActivityType>("ALL");

  // SMS Filter
  const [smsStatusFilter, setSmsStatusFilter] = useState<"ALL" | "DELIVERED" | "QUEUED" | "FAILED">("ALL");

  // Manual SMS Modal
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("0917 123 4567");
  const [recipientName, setRecipientName] = useState("Juan Dela Cruz");
  const [messageText, setMessageText] = useState(
    "CK Condo Drop Hub: Friendly reminder that you have 2 package(s) ready for pickup at the Lobby. Please claim before the holding deadline."
  );
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const totalActivities = activityLogs.length;
    const ingestCount = activityLogs.filter((a) => a.type === "PARCEL_INGESTED").length;
    const releaseCount = activityLogs.filter((a) => a.type === "PARCEL_RELEASED").length;
    const smsDelivered = smsLogs.filter((s) => s.status === "DELIVERED").length;
    const totalCost = (smsLogs.length * 0.4).toFixed(2);

    return { totalActivities, ingestCount, releaseCount, smsDelivered, totalCost };
  }, [activityLogs, smsLogs]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    if (activityFilter === "ALL") return activityLogs;
    return activityLogs.filter((a) => a.type === activityFilter);
  }, [activityLogs, activityFilter]);

  // Filtered SMS
  const filteredSms = useMemo(() => {
    if (smsStatusFilter === "ALL") return smsLogs;
    return smsLogs.filter((s) => s.status === smsStatusFilter);
  }, [smsLogs, smsStatusFilter]);

  // Handle Send Test SMS
  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || !messageText) return;

    try {
      await sendTestSms(recipientPhone, recipientName, messageText);
      setSmsFeedback(`✓ Message dispatched successfully to ${recipientPhone}!`);
      setShowSmsModal(false);
      setTimeout(() => setSmsFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to send SMS.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            AUDIT LOGS & <span className="text-brand-red">SMS QUEUE</span>
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Lobby counter event trail and simulated carrier SMS gateway delivery dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/inquiries" className="btn btn-outline btn-sm font-bold">
            Lobby Inquiries
          </Link>
          <button
            type="button"
            onClick={() => setShowSmsModal(true)}
            className="btn btn-primary btn-sm"
          >
            Send Manual SMS
          </button>
          <Link href="/admin" className="btn btn-outline btn-sm">
            ← Station Admin
          </Link>
        </div>
      </div>

      {/* Success Alert */}
      {smsFeedback && (
        <div className="bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <span>{smsFeedback}</span>
          <button
            onClick={() => setSmsFeedback(null)}
            className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 bg-black/20 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Total Events</span>
          <div className="text-2xl font-black text-brand-black mt-0.5">{stats.totalActivities}</div>
          <span className="text-[10px] text-brand-text-secondary">Logged in station registry</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Inbound Intakes</span>
          <div className="text-2xl font-black text-orange-600 mt-0.5">{stats.ingestCount}</div>
          <span className="text-[10px] text-orange-700 font-semibold">Parcels received</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">Resident Releases</span>
          <div className="text-2xl font-black text-green-600 mt-0.5">{stats.releaseCount}</div>
          <span className="text-[10px] text-green-700 font-semibold">Completed handoffs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-brand-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-brand-text-muted">SMS Gateway Spend</span>
          <div className="text-2xl font-black text-blue-600 mt-0.5">₱{stats.totalCost}</div>
          <span className="text-[10px] text-blue-700 font-semibold">
            {stats.smsDelivered} messages delivered
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white rounded-2xl border border-brand-border p-1.5 gap-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("ACTIVITY")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
            activeTab === "ACTIVITY"
              ? "bg-brand-black text-white shadow-md"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
          }`}
        >
          Station Activity Trail ({activityLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SMS_QUEUE")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all ${
            activeTab === "SMS_QUEUE"
              ? "bg-brand-red text-white shadow-md"
              : "text-brand-text-secondary hover:text-brand-black hover:bg-brand-surface"
          }`}
        >
          Outbound SMS Gateway Queue ({smsLogs.length})
        </button>
      </div>

      {/* Tab 1: Activity Audit Trail */}
      {activeTab === "ACTIVITY" && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-brand-border shadow-sm">
            <span className="text-xs font-bold text-brand-text-muted uppercase mr-1">Filter:</span>
            {[
              { id: "ALL", label: "All Events" },
              { id: "PARCEL_INGESTED", label: "Intake / Ingest" },
              { id: "CLAIM_VERIFIED", label: "Claim Verified" },
              { id: "PARCEL_RELEASED", label: "Released" },
              { id: "SMS_DISPATCHED", label: "SMS Dispatched" },
              { id: "SETTINGS_UPDATED", label: "Settings" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActivityFilter(f.id as typeof activityFilter)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  activityFilter === f.id
                    ? "bg-brand-red text-white"
                    : "bg-brand-surface text-brand-text-secondary hover:text-brand-black hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Stream */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-10 text-brand-text-muted">
                No activity logs match this filter.
              </div>
            ) : (
              <div className="relative border-l-2 border-brand-border ml-3 space-y-6 pl-6">
                {filteredActivities.map((log) => (
                  <div key={log.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-brand-red group-hover:scale-125 transition-transform" />

                    <div className="bg-brand-surface p-4 rounded-xl border border-brand-border/80 hover:border-brand-border transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded text-white ${
                              log.badgeColor || "bg-brand-dark"
                            }`}
                          >
                            {log.type.replace("_", " ")}
                          </span>
                          <h3 className="font-bold text-sm text-brand-black">{log.title}</h3>
                        </div>
                        <span className="text-[11px] text-brand-text-secondary font-mono">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-brand-text mt-1">{log.description}</p>

                      <div className="flex items-center gap-4 mt-2.5 pt-2 border-t border-brand-border/60 text-[10px] text-brand-text-muted">
                        <span>
                          Actor: <strong>{log.actor}</strong>
                        </span>
                        {log.trackingNumber && (
                          <span>
                            Tracking: <strong className="font-mono">{log.trackingNumber}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Outbound SMS Queue */}
      {activeTab === "SMS_QUEUE" && (
        <div className="space-y-4">
          {/* SMS Status Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-brand-border shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-text-muted uppercase mr-1">Status:</span>
              {[
                { id: "ALL", label: `All (${smsLogs.length})` },
                {
                  id: "DELIVERED",
                  label: `Delivered (${smsLogs.filter((s) => s.status === "DELIVERED").length})`,
                },
                {
                  id: "QUEUED",
                  label: `Queued (${smsLogs.filter((s) => s.status === "QUEUED").length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSmsStatusFilter(tab.id as typeof smsStatusFilter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    smsStatusFilter === tab.id
                      ? "bg-brand-red text-white"
                      : "bg-brand-surface text-brand-text-secondary hover:text-brand-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-brand-text-muted flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Gateway: <strong>{hubSettings.smsSenderId}</strong> (Active)</span>
            </div>
          </div>

          {/* SMS Messages Table */}
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-surface border-b border-brand-border text-[10px] uppercase font-black tracking-wider text-brand-text-muted">
                    <th className="py-3.5 px-4">Recipient</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">Message Body Preview</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Carrier Cost</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredSms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-brand-text-muted">
                        No SMS messages in queue.
                      </td>
                    </tr>
                  ) : (
                    filteredSms.map((sms) => (
                      <tr key={sms.id} className="hover:bg-brand-surface/70">
                        <td className="py-3.5 px-4 font-bold text-brand-black">
                          {sms.recipientName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-brand-text">
                          {sms.recipientPhone}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-brand-text-secondary" title={sms.messageText}>
                          {sms.messageText}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-brand-text-muted">
                          {sms.timestamp}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-black">
                          {sms.costEstimate}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            ✓ {sms.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual SMS Dispatch Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-brand-border">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="font-[family-name:var(--font-heading)] text-xl uppercase text-brand-black">
                SEND SMS BROADCAST / TEST
              </h3>
              <button
                onClick={() => setShowSmsModal(false)}
                className="text-brand-text-muted hover:text-brand-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSms} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-brand-text mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="input text-xs border border-gray-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-brand-text mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="input text-xs font-mono border border-gray-300 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-brand-text mb-1">
                  Message Content (Sender ID: {hubSettings.smsSenderId})
                </label>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="input text-xs leading-relaxed border border-gray-300 bg-white"
                  required
                />
                <span className="text-[10px] text-brand-text-muted mt-1 block">
                  Carrier rate: ₱0.40 / 160 characters. Standard Semaphore SMS Gateway simulated.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSmsModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  DISPATCH SMS NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
