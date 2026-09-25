"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ResidentProfile, InvoiceRecord } from "@/types";
import { db } from "@/lib/db/local-store";
import { useParcels } from "@/context";
import { getAllInvoices, confirmCashPayment } from "@/lib/db/invoices";

export default function AdminCustomersPage() {
  const { parcels } = useParcels();
  const [activeTab, setActiveTab] = useState<"DIRECTORY" | "PAYMENTS">("DIRECTORY");

  // Residents State
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [towerFilter, setTowerFilter] = useState("ALL");
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null);

  // Invoices & Payments State
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [paymentFeedback, setPaymentFeedback] = useState<string | null>(null);

  // Load Residents
  const loadResidents = useCallback(async () => {
    try {
      setLoadingResidents(true);
      const all = await db.getAllResidents();
      setResidents(all);
    } finally {
      setLoadingResidents(false);
    }
  }, []);

  // Load Invoices
  const loadInvoices = useCallback(async () => {
    try {
      setLoadingInvoices(true);
      const list = await getAllInvoices();
      setInvoices(list);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    loadResidents();
    loadInvoices();

    const handleDbUpdate = () => {
      loadResidents();
      loadInvoices();
    };

    window.addEventListener("ck_db_updated", handleDbUpdate);
    window.addEventListener("storage", handleDbUpdate);
    return () => {
      window.removeEventListener("ck_db_updated", handleDbUpdate);
      window.removeEventListener("storage", handleDbUpdate);
    };
  }, [loadResidents, loadInvoices]);

  // Filtered Residents
  const filteredResidents = useMemo(() => {
    return residents.filter((res) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        res.name.toLowerCase().includes(q) ||
        res.unit.toLowerCase().includes(q) ||
        res.residentCode.toLowerCase().includes(q) ||
        res.phone.includes(q) ||
        res.email.toLowerCase().includes(q);

      const matchesTower = towerFilter === "ALL" || res.tower === towerFilter;
      return matchesSearch && matchesTower;
    });
  }, [residents, searchQuery, towerFilter]);

  // 5-item pagination for registered residents
  const [residentPage, setResidentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setResidentPage(1);
  }, [searchQuery, towerFilter]);

  const totalResidentPages = Math.ceil(filteredResidents.length / ITEMS_PER_PAGE) || 1;
  const validResidentPage = Math.min(Math.max(1, residentPage), totalResidentPages);
  const startResIndex = (validResidentPage - 1) * ITEMS_PER_PAGE;
  const endResIndex = Math.min(startResIndex + ITEMS_PER_PAGE, filteredResidents.length);
  const paginatedResidents = filteredResidents.slice(startResIndex, endResIndex);

  // Active parcels per resident
  const getActiveParcelsForResident = (residentId: string) => {
    return parcels.filter(
      (p) => p.residentId === residentId && (p.status === "READY" || p.status === "OVERDUE")
    ).length;
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = invoiceSearch.toLowerCase();
      const matchesSearch =
        !q ||
        inv.residentName.toLowerCase().includes(q) ||
        inv.unit.toLowerCase().includes(q) ||
        inv.residentCode.toLowerCase().includes(q) ||
        inv.id.toLowerCase().includes(q) ||
        (inv.reference && inv.reference.toLowerCase().includes(q)) ||
        inv.plan.toLowerCase().includes(q);

      const matchesStatus =
        invoiceStatusFilter === "ALL" || inv.status === invoiceStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  // 5-item pagination for Invoices
  const [invoicePage, setInvoicePage] = useState(1);

  useEffect(() => {
    setInvoicePage(1);
  }, [invoiceSearch, invoiceStatusFilter]);

  const totalInvoicePages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE) || 1;
  const validInvoicePage = Math.min(Math.max(1, invoicePage), totalInvoicePages);
  const startInvIndex = (validInvoicePage - 1) * ITEMS_PER_PAGE;
  const endInvIndex = Math.min(startInvIndex + ITEMS_PER_PAGE, filteredInvoices.length);
  const paginatedInvoices = filteredInvoices.slice(startInvIndex, endInvIndex);

  const pendingSettlementCount = invoices.filter((i) => i.status === "PENDING").length;
  const paidInvoiceCount = invoices.filter((i) => i.status === "PAID").length;

  // Handle staff confirming cash payment
  const handleConfirmCash = async (invoiceId: string) => {
    try {
      const confirmed = await confirmCashPayment(invoiceId);
      if (confirmed) {
        setPaymentFeedback(
          `✓ Payment verified! ${confirmed.residentName}'s ${confirmed.plan} is now ACTIVE and official receipt is marked PAID.`
        );
        await loadInvoices();
        await loadResidents();
        setTimeout(() => setPaymentFeedback(null), 5000);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to confirm cash payment.");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            RESIDENTS & <span className="text-brand-red">UNITS</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Condominium unit directory, resident subscription tiers, and connected billing receipts ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/register" className="btn btn-primary btn-sm font-bold uppercase">
            + Register New Resident
          </Link>
        </div>
      </div>

      {/* Payment Feedback Notification */}
      {paymentFeedback && (
        <div className="bg-green-50 border border-green-200 text-green-900 px-6 py-3.5 rounded-xl flex items-center justify-between text-xs sm:text-sm animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
            <span className="font-semibold">{paymentFeedback}</span>
          </div>
          <button
            onClick={() => setPaymentFeedback(null)}
            className="text-green-700 hover:text-green-950 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border">
        <button
          type="button"
          onClick={() => setActiveTab("DIRECTORY")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "DIRECTORY"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-brand-text-secondary hover:text-brand-black"
          }`}
        >
          <span>Residents Directory</span>
          <span className="bg-brand-surface text-brand-black text-[10px] px-2 py-0.5 rounded-full font-bold">
            {residents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYMENTS")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "PAYMENTS"
              ? "border-brand-red text-brand-red font-black"
              : "border-transparent text-brand-text-secondary hover:text-brand-black"
          }`}
        >
          <span>Payment & Billing Logs</span>
          {pendingSettlementCount > 0 ? (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {pendingSettlementCount} Pending Settle
            </span>
          ) : (
            <span className="bg-brand-surface text-brand-black text-[10px] px-2 py-0.5 rounded-full font-bold">
              {invoices.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: RESIDENTS DIRECTORY */}
      {activeTab === "DIRECTORY" && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="w-full md:w-96 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, unit number, or CK-code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs w-full border border-gray-300 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-brand-text-secondary whitespace-nowrap">
                Filter Tower:
              </span>
              <select
                value={towerFilter}
                onChange={(e) => setTowerFilter(e.target.value)}
                className="input text-xs py-1.5 cursor-pointer border border-gray-300 bg-white"
              >
                <option value="ALL">All Towers</option>
                <option value="Tower A">Tower A</option>
                <option value="Tower B">Tower B</option>
                <option value="Tower C">Tower C</option>
              </select>
            </div>
          </div>

          {/* Residents Table */}
          <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface text-brand-text-secondary uppercase border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3">Resident Code & Name</th>
                    <th className="px-4 py-3">Unit & Tower</th>
                    <th className="px-4 py-3">Phone & Email</th>
                    <th className="px-4 py-3">Membership Plan</th>
                    <th className="px-4 py-3">Parcels at Hub</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {loadingResidents ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary">
                        Loading registered residents...
                      </td>
                    </tr>
                  ) : filteredResidents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary">
                        No residents found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedResidents.map((res) => {
                      const readyCount = getActiveParcelsForResident(res.id);
                      return (
                        <tr key={res.id} className="hover:bg-brand-surface/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-brand-black">{res.name}</div>
                            <span className="font-mono text-[10px] text-brand-red font-semibold">
                              {res.residentCode}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-brand-text">{res.unit}</div>
                            <div className="text-[11px] text-brand-text-secondary">{res.tower}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="text-brand-text">{res.phone}</div>
                            <div className="text-[10px] text-brand-text-secondary">{res.email}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  res.plan === "PREMIUM"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : res.plan === "REGULAR"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {res.plan.replace("_", " ")}
                              </span>
                              {res.planStatus === "PENDING_PAYMENT" && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-300 animate-pulse">
                                  Pending Settle
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1">
                              {res.plan === "PREMIUM"
                                ? "30d Unlimited • 7d Grace • 5 Door Deliv."
                                : res.plan === "REGULAR"
                                ? "15d Unlimited • 3d Grace • No Door Deliv."
                                : "₱20 / Claim • 2d Grace"}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {readyCount > 0 ? (
                              <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[11px]">
                                {readyCount} Ready
                              </span>
                            ) : (
                              <span className="text-brand-text-muted text-[11px]">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedResident(res)}
                              className="btn btn-outline btn-sm !py-1 !text-xs cursor-pointer"
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 5-Item Pagination Controls Footer */}
            {filteredResidents.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-brand-border bg-white">
                <div className="text-xs text-brand-text-secondary font-medium text-center sm:text-left">
                  Showing{" "}
                  <span className="font-bold text-brand-black">
                    {filteredResidents.length === 0 ? 0 : startResIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-brand-black">{endResIndex}</span>{" "}
                  of{" "}
                  <span className="font-bold text-brand-black">{filteredResidents.length}</span>{" "}
                  residents
                  {totalResidentPages > 1 && (
                    <span className="ml-1 text-brand-text-muted font-semibold">
                      (Page {validResidentPage} of {totalResidentPages})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResidentPage((p) => Math.max(1, p - 1))}
                    disabled={validResidentPage <= 1}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      validResidentPage <= 1
                        ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                    }`}
                    title="Previous page"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalResidentPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setResidentPage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        validResidentPage === pageNum
                          ? "bg-brand-red text-white shadow-xs"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setResidentPage((p) => Math.min(totalResidentPages, p + 1))}
                    disabled={validResidentPage >= totalResidentPages}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      validResidentPage >= totalResidentPages
                        ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                    }`}
                    title="Next page"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT & BILLING RECEIPTS LOGS */}
      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="w-full md:w-96 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search invoice #, resident name, or unit..."
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                className="input pl-8 text-xs w-full border border-gray-300 bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start md:self-auto">
              {[
                { id: "ALL", label: `All (${invoices.length})` },
                { id: "PAID", label: `Paid (${paidInvoiceCount})` },
                { id: "PENDING", label: `Pending Settle (${pendingSettlementCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setInvoiceStatusFilter(tab.id as typeof invoiceStatusFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    invoiceStatusFilter === tab.id
                      ? "bg-brand-red text-white shadow-xs"
                      : "bg-brand-surface text-brand-text-secondary hover:text-brand-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Invoices Table */}
          <div className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-surface text-brand-text-secondary uppercase border-b border-brand-border">
                  <tr>
                    <th className="px-4 py-3">Invoice & Reference</th>
                    <th className="px-4 py-3">Resident & Unit</th>
                    <th className="px-4 py-3">Plan / Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-brand-text-secondary">
                        Loading payment logs...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-brand-text-secondary">
                        No payment records found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((inv) => {
                      const isPending = inv.status === "PENDING";
                      return (
                        <tr
                          key={inv.id}
                          className={`hover:bg-brand-surface/60 transition-colors ${
                            isPending ? "bg-amber-50/50" : ""
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-brand-black">{inv.id}</div>
                            {inv.reference && (
                              <div className="font-mono text-[10px] text-gray-500">
                                Ref: {inv.reference}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-brand-black">{inv.residentName}</div>
                            <div className="text-[11px] text-brand-text-secondary">
                              {inv.unit} • {inv.residentCode}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-brand-text">
                            {inv.plan}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-brand-black font-mono">
                            {inv.amount}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inv.method.includes("GCash")
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              {inv.method}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-brand-text-secondary">
                            {inv.date}
                          </td>
                          <td className="px-4 py-3.5">
                            {isPending ? (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                Pending Settle
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                                <span>✓</span>
                                <span>Paid</span>
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {isPending ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmCash(inv.id)}
                                className="btn btn-sm bg-green-700 hover:bg-green-800 text-white text-[11px] font-bold py-1 px-2.5 uppercase cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                Confirm Cash ✓
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="text-xs font-semibold text-brand-red hover:underline cursor-pointer"
                              >
                                View Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 5-Item Pagination Controls Footer */}
            {filteredInvoices.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-brand-border bg-white">
                <div className="text-xs text-brand-text-secondary font-medium text-center sm:text-left">
                  Showing{" "}
                  <span className="font-bold text-brand-black">
                    {filteredInvoices.length === 0 ? 0 : startInvIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-brand-black">{endInvIndex}</span>{" "}
                  of{" "}
                  <span className="font-bold text-brand-black">{filteredInvoices.length}</span>{" "}
                  payment records
                  {totalInvoicePages > 1 && (
                    <span className="ml-1 text-brand-text-muted font-semibold">
                      (Page {validInvoicePage} of {totalInvoicePages})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                    disabled={validInvoicePage <= 1}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      validInvoicePage <= 1
                        ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                    }`}
                    title="Previous page"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalInvoicePages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setInvoicePage(pageNum)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        validInvoicePage === pageNum
                          ? "bg-brand-red text-white shadow-xs"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setInvoicePage((p) => Math.min(totalInvoicePages, p + 1))}
                    disabled={validInvoicePage >= totalInvoicePages}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                      validInvoicePage >= totalInvoicePages
                        ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
                    }`}
                    title="Next page"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resident Details Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-red text-white font-bold flex items-center justify-center text-xs">
                  {selectedResident.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black uppercase">
                    {selectedResident.name}
                  </h3>
                  <p className="text-xs text-brand-text-secondary font-mono">
                    {selectedResident.residentCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-brand-text-muted hover:text-brand-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Unit</span>
                <span className="font-semibold text-brand-black">{selectedResident.unit}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Tower</span>
                <span className="font-semibold text-brand-black">{selectedResident.tower}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Phone</span>
                <span className="text-brand-black font-medium">{selectedResident.phone}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Email</span>
                <span className="text-brand-black font-medium truncate block">{selectedResident.email}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Membership Tier</span>
                <span className="font-bold text-brand-red uppercase">{selectedResident.plan}</span>
              </div>
              <div>
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">Plan Status</span>
                <span
                  className={`font-bold uppercase ${
                    selectedResident.planStatus === "ACTIVE" ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {selectedResident.planStatus}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-brand-text-muted block text-[10px] uppercase font-bold">
                  Authorized Proxy Claimant
                </span>
                <span className="text-brand-black">
                  {selectedResident.authorizedClaimant
                    ? `${selectedResident.authorizedClaimant} (${selectedResident.claimantPhone || "No Phone"})`
                    : "None registered"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {selectedResident.planStatus === "PENDING_PAYMENT" ? (
                <button
                  type="button"
                  onClick={async () => {
                    await db.updateResidentProfile(selectedResident.id, { planStatus: "ACTIVE" });
                    // Also find invoice and confirm
                    const residentInv = invoices.find(
                      (i) => i.residentId === selectedResident.id && i.status === "PENDING"
                    );
                    if (residentInv) {
                      await confirmCashPayment(residentInv.id);
                    }
                    await loadResidents();
                    await loadInvoices();
                    setSelectedResident(null);
                    setPaymentFeedback(
                      `✓ Cash payment confirmed! ${selectedResident.name}'s plan is now ACTIVE.`
                    );
                  }}
                  className="btn btn-sm bg-green-700 hover:bg-green-800 text-white font-bold uppercase cursor-pointer"
                >
                  Confirm Cash Payment ✓
                </button>
              ) : (
                <span className="text-xs text-green-700 font-semibold flex items-center gap-1">
                  <span>✓</span> Account Verified & Active
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedResident(null)}
                className="btn btn-outline btn-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black uppercase">
                  OFFICIAL RECEIPT
                </h3>
                <p className="text-xs text-brand-text-secondary font-mono">{selectedInvoice.id}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-brand-text-muted hover:text-brand-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Resident Name:</span>
                <span className="font-bold text-brand-black">{selectedInvoice.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Unit / Tower:</span>
                <span className="font-semibold text-brand-black">
                  {selectedInvoice.unit} • {selectedInvoice.tower}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Resident Code:</span>
                <span className="font-mono font-bold text-brand-red">
                  {selectedInvoice.residentCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Description:</span>
                <span className="font-medium text-brand-black">{selectedInvoice.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Amount Paid:</span>
                <span className="font-mono font-bold text-brand-black text-sm">
                  {selectedInvoice.amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Payment Method:</span>
                <span className="font-semibold text-brand-black">{selectedInvoice.method}</span>
              </div>
              {selectedInvoice.reference && (
                <div className="flex justify-between">
                  <span className="text-brand-text-secondary">Transaction Ref:</span>
                  <span className="font-mono text-brand-black">{selectedInvoice.reference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-brand-text-secondary">Date Issued:</span>
                <span className="text-brand-black">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-brand-border">
                <span className="text-brand-text-secondary">Payment Status:</span>
                <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  ✓ {selectedInvoice.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-primary btn-sm cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
