"use client";

import React from "react";
import { InvoiceRecord } from "@/types";

interface InvoiceReceiptModalProps {
  invoice: InvoiceRecord | null;
  onClose: () => void;
}

export default function InvoiceReceiptModal({
  invoice,
  onClose,
}: InvoiceReceiptModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg text-brand-black uppercase">
              OFFICIAL RECEIPT
            </h3>
            <p className="text-xs text-brand-text-secondary font-mono">{invoice.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-muted hover:text-brand-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 text-xs bg-brand-surface p-4 rounded-xl border border-brand-border">
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Resident Name:</span>
            <span className="font-bold text-brand-black">{invoice.residentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Unit / Tower:</span>
            <span className="font-semibold text-brand-black">
              {invoice.unit} • {invoice.tower}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Resident Code:</span>
            <span className="font-mono font-bold text-brand-red">
              {invoice.residentCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Description:</span>
            <span className="font-medium text-brand-black">{invoice.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Amount Paid:</span>
            <span className="font-mono font-bold text-brand-black text-sm">
              {invoice.amount}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Payment Method:</span>
            <span className="font-semibold text-brand-black">{invoice.method}</span>
          </div>
          {invoice.reference && (
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Transaction Ref:</span>
              <span className="font-mono text-brand-black">{invoice.reference}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Date Issued:</span>
            <span className="text-brand-black">{invoice.date}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-brand-border">
            <span className="text-brand-text-secondary">Payment Status:</span>
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              ✓ {invoice.status}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
