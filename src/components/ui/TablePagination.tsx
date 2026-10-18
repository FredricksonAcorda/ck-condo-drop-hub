"use client";

import React from "react";

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
}

/**
 * Generates an array of page numbers with smart ellipsis (...),
 * ensuring a maximum of 7 visible page navigation buttons.
 */
function getSmartPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  // Near the end
  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // In the middle
  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = "records",
}: TablePaginationProps) {
  if (totalItems === 0) return null;

  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const pageNumbers = getSmartPageNumbers(validPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-brand-border bg-white select-none">
      {/* Left: Summary and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-text-secondary font-medium">
        <div>
          Showing <span className="font-bold text-brand-black">{startIndex + 1}</span> to{" "}
          <span className="font-bold text-brand-black">{endIndex}</span> of{" "}
          <span className="font-bold text-brand-black">{totalItems}</span> {itemLabel}
          {totalPages > 1 && (
            <span className="ml-1 text-brand-text-muted font-semibold">
              (Page {validPage} of {totalPages})
            </span>
          )}
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2 pl-0 sm:pl-3 sm:border-l sm:border-gray-200">
            <span className="text-gray-500 font-normal">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Select number of rows per page"
              className="bg-white border border-gray-300 text-gray-700 font-bold text-xs rounded-lg px-2 py-1 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/30 transition-all shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Prev, Smart Numbered Buttons, Next */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(validPage - 1)}
          disabled={validPage <= 1}
          className={`h-8 px-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
            validPage <= 1
              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
          }`}
          title="Previous page"
        >
          <span aria-hidden="true">‹</span>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Buttons with Ellipsis */}
        {pageNumbers.map((p, idx) =>
          p === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400 select-none"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                validPage === p
                  ? "bg-brand-red text-white shadow-xs font-extrabold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-black border border-transparent hover:border-gray-200"
              }`}
              aria-current={validPage === p ? "page" : undefined}
              title={`Page ${p}`}
            >
              {p}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(validPage + 1)}
          disabled={validPage >= totalPages}
          className={`h-8 px-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
            validPage >= totalPages
              ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-black shadow-2xs"
          }`}
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
