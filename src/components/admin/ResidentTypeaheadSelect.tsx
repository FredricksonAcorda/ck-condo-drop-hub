"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ResidentProfile } from "@/types";

interface ResidentTypeaheadSelectProps {
  residents: ResidentProfile[];
  selectedResidentId: string;
  onSelect: (resident: ResidentProfile) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function ResidentTypeaheadSelect({
  residents,
  selectedResidentId,
  onSelect,
  disabled = false,
  required = false,
}: ResidentTypeaheadSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Selected resident profile
  const selectedResident = useMemo(() => {
    return residents.find((r) => r.id === selectedResidentId) || null;
  }, [residents, selectedResidentId]);

  // Real-time multi-character typeahead filter
  // Shrinks directory list instantly as letters are typed (e.g., 'J' then 'o' -> 'John', 'Jones')
  const filteredResidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return residents;

    return residents.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const unitMatch = r.unit.toLowerCase().includes(q);
      const towerMatch = (r.branch || r.tower).toLowerCase().includes(q);
      const bldgMatch = (r.buildingNumber || "").toLowerCase().includes(q);
      const floorMatch = (r.floorNumber || "").toLowerCase().includes(q);
      const unitNumMatch = (r.unitNumber || "").toLowerCase().includes(q);
      const codeMatch = r.residentCode.toLowerCase().includes(q);
      const phoneMatch = r.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
      return (
        nameMatch ||
        unitMatch ||
        towerMatch ||
        bldgMatch ||
        floorMatch ||
        unitNumMatch ||
        codeMatch ||
        phoneMatch
      );
    });
  }, [residents, searchQuery]);

  // Keep highlighted index within bounds when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset query text to show selected resident name if not typing
        if (selectedResident) {
          setSearchQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedResident]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredResidents.length - 1 ? prev + 1 : 0
      );
      scrollHighlightedIntoView(highlightedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResidents.length - 1
      );
      scrollHighlightedIntoView(highlightedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResidents[highlightedIndex]) {
        handlePickResident(filteredResidents[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const scrollHighlightedIntoView = (index: number) => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLButtonElement>("[data-typeahead-item]");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  };

  const handlePickResident = (res: ResidentProfile) => {
    onSelect(res);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Helper to highlight matching text in search results
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-black font-extrabold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const displayInputValue = isOpen
    ? searchQuery
    : selectedResident
    ? `${selectedResident.name} — ${selectedResident.unit} (${selectedResident.branch || selectedResident.tower})`
    : "";

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          required={required && !selectedResidentId}
          value={displayInputValue}
          placeholder="Search by name, bldg #, floor #, unit # and/or branch"
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery("");
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={`input pl-3.5 pr-10 text-xs w-full cursor-text border font-medium h-11 transition-all ${
            isOpen
              ? "border-brand-red ring-2 ring-brand-red/20 bg-white"
              : selectedResident
              ? "border-gray-300 bg-white text-gray-900 font-semibold"
              : "border-gray-300 bg-white text-gray-500"
          }`}
          autoComplete="off"
        />

        {/* Clear Control */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {(searchQuery || selectedResident) && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-md text-xs font-bold cursor-pointer"
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Floating Scrollable Typeahead Directory List */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header count info */}
          <div className="bg-gray-50 px-3.5 py-2 border-b border-gray-200 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span>
              {searchQuery.trim()
                ? `Showing ${filteredResidents.length} matching resident${filteredResidents.length === 1 ? "" : "s"}`
                : `Condo Directory (${residents.length} Residents)`}
            </span>
            <span className="text-[10px] text-gray-400">↑↓ to navigate • Enter to pick</span>
          </div>

          {/* Scrollable Items Container */}
          <div ref={listRef} className="max-h-60 overflow-y-auto divide-y divide-gray-100 overscroll-contain">
            {filteredResidents.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-700">
                  No resident found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-gray-400">
                  Try typing the unit number or check spelling.
                </p>
              </div>
            ) : (
              filteredResidents.map((res, idx) => {
                const isSelected = res.id === selectedResidentId;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={res.id}
                    data-typeahead-item
                    type="button"
                    onClick={() => handlePickResident(res)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-red-50/80 text-brand-red font-bold"
                        : isHighlighted
                        ? "bg-gray-100 text-gray-900"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">
                          {renderHighlightedText(res.name, searchQuery)}
                        </span>
                        {res.plan === "PREMIUM" ? (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black uppercase px-1.5 py-0.2 rounded shrink-0">
                            VIP
                          </span>
                        ) : res.plan === "REGULAR" ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0">
                            REGULAR
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                        <span className="font-medium text-gray-700">
                          {renderHighlightedText(res.unit, searchQuery)} ({res.branch || res.tower})
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-gray-400">
                          {renderHighlightedText(res.residentCode, searchQuery)}
                        </span>
                        {res.phone && (
                          <>
                            <span>•</span>
                            <span className="text-[10px] text-gray-400">{res.phone}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <span className="text-brand-red font-black text-sm shrink-0">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
