"use client";

import Link from "next/link";
import { useState } from "react";

interface Resident {
  id: string;
  name: string;
  code: string;
  unit: string;
  tower: string;
  phone: string;
  email: string;
  plan: "PREMIUM" | "REGULAR" | "PER_PARCEL";
  readyParcelsCount: number;
  status: "ACTIVE" | "INACTIVE";
}

const initialResidents: Resident[] = [
  {
    id: "res-1",
    name: "Juan Dela Cruz",
    code: "CK-000123",
    unit: "Unit 101",
    tower: "Tower A",
    phone: "0917 123 4567",
    email: "juan.delacruz@example.com",
    plan: "PREMIUM",
    readyParcelsCount: 3,
    status: "ACTIVE",
  },
  {
    id: "res-2",
    name: "Maria Santos",
    code: "CK-000189",
    unit: "Unit 304",
    tower: "Tower B",
    phone: "0918 234 5678",
    email: "maria.santos@example.com",
    plan: "REGULAR",
    readyParcelsCount: 1,
    status: "ACTIVE",
  },
  {
    id: "res-3",
    name: "Robert Lim",
    code: "CK-000215",
    unit: "Unit 512",
    tower: "Tower A",
    phone: "0920 345 6789",
    email: "robert.lim@example.com",
    plan: "PER_PARCEL",
    readyParcelsCount: 1,
    status: "ACTIVE",
  },
  {
    id: "res-4",
    name: "Angela Cruz",
    code: "CK-000302",
    unit: "Unit 202",
    tower: "Tower C",
    phone: "0922 456 7890",
    email: "angela.cruz@example.com",
    plan: "PREMIUM",
    readyParcelsCount: 0,
    status: "ACTIVE",
  },
  {
    id: "res-5",
    name: "David Tan",
    code: "CK-000388",
    unit: "Unit 808",
    tower: "Tower B",
    phone: "0927 567 8901",
    email: "david.tan@example.com",
    plan: "REGULAR",
    readyParcelsCount: 0,
    status: "ACTIVE",
  },
];

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [towerFilter, setTowerFilter] = useState("ALL");
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const filtered = initialResidents.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.phone.includes(searchQuery);

    const matchesTower =
      towerFilter === "ALL" || res.tower === towerFilter;

    return matchesSearch && matchesTower;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl text-brand-black uppercase tracking-wide">
              RESIDENTS & <span className="text-brand-red">CUSTOMERS</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
            Directory of registered condominium residents, unit numbers, and active parcel counts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedResident(initialResidents[0])}
            className="btn btn-primary btn-sm"
          >
            + Register New Resident
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-brand-border flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="w-full md:w-96 relative">
          <span className="absolute left-3 top-2.5 text-brand-text-muted">🔍</span>
          <input
            type="text"
            placeholder="Search by name, unit number, or CK-code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-brand-text-secondary whitespace-nowrap">
            Filter Tower:
          </span>
          <select
            value={towerFilter}
            onChange={(e) => setTowerFilter(e.target.value)}
            className="input text-xs py-1.5"
          >
            <option value="ALL">All Towers (A, B, C)</option>
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
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-brand-surface/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-brand-black">{res.name}</div>
                    <span className="font-mono text-[10px] text-brand-red font-semibold">
                      {res.code}
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
                          ? "bg-premium-cream text-premium-gold border border-premium-gold/30"
                          : res.plan === "REGULAR"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {res.plan.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {res.readyParcelsCount > 0 ? (
                      <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {res.readyParcelsCount} Ready
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
              ))}
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
                    {selectedResident.code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
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
                <span className="text-brand-text-secondary block mb-0.5">Parcels at Hub:</span>
                <p>Currently storing <strong>{selectedResident.readyParcelsCount} parcels</strong> in Station 1 inventory.</p>
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
                href="/admin"
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
