"use client";

import { useState, useMemo } from "react";
import { useParcels } from "@/context";
import { InquiryStatus } from "@/types";

export default function AdminInquiriesPage() {
  const { inquiries, updateInquiryStatus, loading } = useParcels();

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<"ALL" | InquiryStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Reply Modal State
  const [replyText, setReplyText] = useState("");
  const [targetStatus, setTargetStatus] = useState<InquiryStatus>("RESOLVED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === "NEW").length;
    const inProgressCount = inquiries.filter((i) => i.status === "IN_PROGRESS").length;
    const resolvedCount = inquiries.filter((i) => i.status === "RESOLVED").length;
    return { total, newCount, inProgressCount, resolvedCount };
  }, [inquiries]);

  // Filtered List
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === "ALL" || inq.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        inq.residentName.toLowerCase().includes(q) ||
        inq.residentUnit.toLowerCase().includes(q) ||
        inq.category.toLowerCase().includes(q) ||
        (inq.trackingNumber && inq.trackingNumber.toLowerCase().includes(q)) ||
        inq.message.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, statusFilter, searchQuery]);

  // Open Reply Modal
  const handleOpenReply = (id: string, defaultStatus: InquiryStatus = "RESOLVED") => {
    const target = inquiries.find((i) => i.id === id);
    if (!target) return;
    setSelectedInquiryId(id);
    setReplyText(target.adminReply || "");
    setTargetStatus(defaultStatus);
  };

  // Submit Reply / Status Update
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId) return;

    setIsSubmitting(true);
    try {
      await updateInquiryStatus(selectedInquiryId, targetStatus, replyText.trim() || undefined);
      setFeedback("✓ Resident inquiry updated and reply dispatched to customer portal!");
      setSelectedInquiryId(null);
      setReplyText("");
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      alert("Failed to update inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
              RESIDENT <span className="text-brand-red">LOBBY INQUIRIES</span>
            </h1>
            {stats.newCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                {stats.newCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Lobby reception inbox: messages, proxy authorizations, and doorstep concierge delivery requests from condo residents.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Lobby Counter</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-gray-900">Live Inbox</span>
        </div>
      </div>

      {/* Success Notification */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-gray-900 text-white border-gray-900 shadow-md"
              : "bg-white text-gray-900 border-gray-200 hover:border-gray-400"
          }`}
        >
          <span className={`text-xs font-bold uppercase tracking-wider block ${statusFilter === "ALL" ? "text-white/70" : "text-gray-500"}`}>
            Total Inquiries
          </span>
          <span className="font-mono text-3xl font-extrabold mt-1 block">
            {stats.total}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("NEW")}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "NEW"
              ? "bg-amber-600 text-white border-amber-600 shadow-md"
              : "bg-white text-gray-900 border-gray-200 hover:border-amber-400"
          }`}
        >
          <span className={`text-xs font-bold uppercase tracking-wider block ${statusFilter === "NEW" ? "text-white/80" : "text-amber-600"}`}>
            New / Unattended
          </span>
          <span className="font-mono text-3xl font-extrabold mt-1 block text-amber-500">
            {stats.newCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("IN_PROGRESS")}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "IN_PROGRESS"
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-900 border-gray-200 hover:border-blue-400"
          }`}
        >
          <span className={`text-xs font-bold uppercase tracking-wider block ${statusFilter === "IN_PROGRESS" ? "text-white/80" : "text-blue-600"}`}>
            In Progress
          </span>
          <span className="font-mono text-3xl font-extrabold mt-1 block text-blue-500">
            {stats.inProgressCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("RESOLVED")}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "RESOLVED"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white text-gray-900 border-gray-200 hover:border-emerald-400"
          }`}
        >
          <span className={`text-xs font-bold uppercase tracking-wider block ${statusFilter === "RESOLVED" ? "text-white/80" : "text-emerald-600"}`}>
            Resolved
          </span>
          <span className="font-mono text-3xl font-extrabold mt-1 block text-emerald-500">
            {stats.resolvedCount}
          </span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search resident, unit, tracking #, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full text-xs pl-9"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong>{filteredInquiries.length}</strong> of {inquiries.length} messages
            </span>
          </div>
        </div>

        {/* Inquiries Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading lobby inquiries...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm space-y-2">
            <span className="text-3xl block">📭</span>
            <p className="font-semibold text-gray-700">No resident inquiries found.</p>
            <p className="text-xs text-gray-400">
              {statusFilter !== "ALL"
                ? `There are currently no inquiries in "${statusFilter}" status.`
                : "Residents have not submitted any messages yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-5 hover:bg-gray-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Resident Info & Message */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        inq.status === "RESOLVED"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : inq.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                      }`}
                    >
                      {inq.status.replace("_", " ")}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{inq.residentName}</span>
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                      {inq.residentUnit}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{inq.residentPhone}</span>
                    <span className="text-[11px] text-gray-400">• {inq.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {inq.category.includes("Doorstep") ? (
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>🚪</span> Doorstep Concierge Request
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-brand-red bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                        {inq.category}
                      </span>
                    )}
                    {inq.trackingNumber && (
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                        Ref: {inq.trackingNumber}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">
                    "{inq.message}"
                  </p>

                  {/* Existing Staff Reply */}
                  {inq.adminReply && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-emerald-800 flex items-center gap-1">
                          <span>✓</span> Lobby Staff Admin Reply:
                        </span>
                        {inq.updatedAt && (
                          <span className="text-[10px] text-emerald-700">{inq.updatedAt}</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-900">{inq.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenReply(inq.id, inq.status === "NEW" ? "RESOLVED" : inq.status)}
                    className="btn btn-primary btn-sm text-xs font-bold uppercase whitespace-nowrap cursor-pointer"
                  >
                    {inq.adminReply ? "Edit Reply / Status" : "Reply to Resident"}
                  </button>

                  {inq.status !== "RESOLVED" && (
                    <button
                      type="button"
                      onClick={() => updateInquiryStatus(inq.id, "RESOLVED")}
                      className="btn btn-outline btn-sm text-xs font-bold text-green-700 !border-green-300 hover:!bg-green-50 whitespace-nowrap cursor-pointer"
                    >
                      Quick Mark Resolved ✓
                    </button>
                  )}

                  {inq.status === "NEW" && (
                    <button
                      type="button"
                      onClick={() => updateInquiryStatus(inq.id, "IN_PROGRESS")}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Mark In Progress →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply / Status Modal */}
      {selectedInquiryId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-gray-900 uppercase">
                  RESPOND TO RESIDENT
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your reply will immediately appear on the resident's portal in their Help Center tab.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiryId(null)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Update Inquiry Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["NEW", "IN_PROGRESS", "RESOLVED"] as InquiryStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
                      className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                        targetStatus === st
                          ? st === "RESOLVED"
                            ? "bg-green-600 text-white border-green-600"
                            : st === "IN_PROGRESS"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lobby Staff Admin Response Message:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="e.g. Package has been retrieved and is ready on Shelf A-04. / Doorstep delivery scheduled for 2:30 PM..."
                  className="input w-full text-xs"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiryId(null)}
                  className="btn btn-outline btn-sm w-1/2 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm w-1/2 font-bold uppercase cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
