"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ResidentProfile } from "@/types";
import { db } from "@/lib/db/local-store";
import { useParcels } from "@/context";

export default function AdminCustomersPage() {
  const { parcels } = useParcels();
  const [residents, setResidents] = useState<ResidentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [towerFilter, setTowerFilter] = useState("ALL");
  const [selectedResident, setSelectedResident] = useState<ResidentProfile | null>(null);

  const loadResidents = useCallback(async () => {
    try {
      setLoading(true);
      const all = await db.getAllResidents();
      setResidents(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResidents();

    const handleDbUpdate = () => {
      loadResidents();
    };

    window.addEventListener("ck_db_updated", handleDbUpdate);
    return () => window.removeEventListener("ck_db_updated", handleDbUpdate);
  }, [loadResidents]);

  const filtered = residents.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.residentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery) ||
      res.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTower =
      towerFilter === "ALL" || res.tower === towerFilter;

    return matchesSearch && matchesTower;
  });

  const getActiveParcelsForResident = (residentId: string) => {
    return parcels.filter(
      (p) => p.residentId === residentId && (p.status === "READY" || p.status === "OVERDUE")
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-brand-border">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
            RESIDENTS & <span className="text-brand-red">CUSTOMERS</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Directory of registered condominium residents, unit numbers, and active parcel counts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/register"
            className="btn btn-primary btn-sm"
          >
            + Register New Resident
          </Link>
        </div>
      </div>

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
            <option value="Tower 1">Tower 1</option>
            <option value="Tower 2">Tower 2</option>
            <option value="Tower 3">Tower 3</option>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary">
                    Loading registered residents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-brand-text-secondary">
                    No residents found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => {
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
                          className="btn btn-outline btn-sm !py-1 !text-xs"
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
      </div>

      {/* Resident Details Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs">
                  {selectedResident.name.substring(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3 className="font-bold text-base text-brand-black">{selectedResident.name}</h3>
                  <span className="text-[10px] text-brand-red font-mono font-bold">
                    {selectedResident.residentCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-brand-surface p-3 rounded-lg border border-brand-border">
                <div>
                  <span className="text-brand-text-secondary block">Unit & Tower:</span>
                  <strong className="text-brand-black">{selectedResident.unit}, {selectedResident.tower}</strong>
                </div>
                <div>
                  <span className="text-brand-text-secondary block">Plan:</span>
                  <strong className="text-brand-red">{selectedResident.plan}</strong>
                </div>
              </div>

              <div>
                <span className="text-brand-text-secondary block mb-0.5">Contact Details:</span>
                <p>Phone: <strong>{selectedResident.phone}</strong></p>
                <p>Email: <strong>{selectedResident.email}</strong></p>
              </div>

              <div>
                <span className="text-brand-text-secondary block mb-0.5">Authorized Claimant:</span>
                <p>{selectedResident.authorizedClaimant || "Self only (No authorized proxy set)"}</p>
                {selectedResident.claimantPhone && (
                  <p className="text-brand-text-muted">Claimant Phone: {selectedResident.claimantPhone}</p>
                )}
              </div>

              <div>
                <span className="text-brand-text-secondary block mb-0.5">Parcels at Hub:</span>
                <p>
                  Currently storing <strong>{getActiveParcelsForResident(selectedResident.id)} active parcels</strong> in Station 1 inventory.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-brand-border flex gap-2">
              <button
                onClick={() => setSelectedResident(null)}
                className="btn btn-outline btn-sm flex-1"
              >
                Close
              </button>
              <Link
                href={`/admin`}
                onClick={() => setSelectedResident(null)}
                className="btn btn-primary btn-sm flex-1 text-center"
              >
                Intake Parcel
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
