"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useParcels } from "@/context";

const adminNav = [
  { label: "DASHBOARD", href: "/admin" },
  { label: "SCANNER STATION", href: "/admin/scanner" },
  { label: "HUB INVENTORY", href: "/admin/parcels" },
  { label: "CUSTOMERS & UNITS", href: "/admin/customers" },
  { label: "LOBBY INQUIRIES", href: "/admin/inquiries" },
  { label: "ACTIVITY & SMS LOGS", href: "/admin/reports" },
  { label: "HUB SETTINGS", href: "/admin/settings" },
  { label: "TRACKING LOOKUP", href: "/track" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { inquiries } = useParcels();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const newInquiriesCount = inquiries.filter((i) => i.status === "NEW").length;

  const staffName = user?.role === "admin" ? user.name : "Lobby Staff Admin";
  const initials = staffName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/login?portal=staff");
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col">
      {/* Desktop Admin Sidebar (Permanently fixed to viewport, zero scroll needed to see logout) */}
      <aside className="hidden lg:flex flex-col fixed top-0 bottom-0 left-0 w-[280px] bg-brand-black text-white h-screen justify-between z-30 border-r border-white/10 select-none">
        {/* Top Brand & Station Header */}
        <div className="flex flex-col shrink-0">
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10">
            <Link href="/admin" className="block">
              <Image
                src="/brand/logo-white.webp"
                alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
                width={220}
                height={60}
                className="h-9 w-auto max-h-[36px] object-contain mb-2 select-none"
                priority
              />
              <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-white/60 bg-white/10 px-2 py-0.5 rounded">
                STAFF PORTAL • ADMIN
              </span>
            </Link>
          </div>

          {/* Station Selector / Status Pill */}
          <div className="px-5 py-3 bg-brand-dark/90 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-white/90">Lobby Counter</span>
            </div>
            <span className="text-[10px] text-white/60 bg-white/10 px-2 py-0.5 rounded font-mono">
              ONLINE
            </span>
          </div>
        </div>

        {/* Admin Navigation (fits viewport cleanly) */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Admin sidebar">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            const isDeskInquiries = item.href === "/admin/inquiries";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-brand-red text-white shadow-md font-black"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.label}</span>
                {isDeskInquiries && newInquiriesCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {newInquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Staff Identity Block & Logout pinned at bottom */}
        <div className="p-4 border-t border-white/10 bg-brand-dark flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-red/30 border border-brand-red flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">{staffName}</p>
              <p className="text-[10px] text-white/60">Staff Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-brand-red transition-colors text-xs font-bold cursor-pointer"
            title="Log Out"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Mobile Admin Topbar Header */}
      <header className="lg:hidden bg-brand-black text-white px-4 py-3 sticky top-0 z-40 flex items-center justify-between border-b border-white/10 shrink-0">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-1.5 rounded text-white hover:bg-white/10"
          aria-label="Toggle admin navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/brand/logo-white.webp"
            alt="CK Condo Drop Hub"
            width={160}
            height={45}
            className="h-7 w-auto max-h-[28px] object-contain select-none"
            priority
          />
          <span className="text-[10px] text-brand-red font-bold uppercase tracking-wider">STAFF</span>
        </div>

        <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-brand-black text-white z-50 lg:hidden overflow-y-auto p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Image
                  src="/brand/logo-white.webp"
                  alt="CK Condo Drop Hub"
                  width={160}
                  height={45}
                  className="h-8 w-auto max-h-[32px] object-contain select-none"
                />
                <button onClick={() => setDrawerOpen(false)} className="text-white/60 p-1">
                  ✕
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {adminNav.map((item) => {
                  const isDeskInquiries = item.href === "/admin/inquiries";
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        pathname === item.href ? "bg-brand-red text-white" : "text-white/70 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isDeskInquiries && newInquiriesCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                          {newInquiriesCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  handleLogout();
                }}
                className="text-xs text-brand-red font-bold cursor-pointer hover:underline"
              >
                LOG OUT OF PORTAL
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Admin Content Canvas (Padded left on desktop for fixed sidebar) */}
      <div className="flex-1 flex flex-col lg:pl-[280px] min-w-0 min-h-screen">
        {/* Desktop Admin Header */}
        <header className="hidden lg:flex items-center justify-between h-[64px] bg-white border-b border-brand-border px-8 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase font-bold text-brand-text-secondary tracking-wider">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-brand-border">|</span>
            <span className="text-xs font-semibold text-brand-text">
              Building: <strong>CK Buildersville Condominium</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/scanner" className="btn btn-primary btn-sm">
              Quick Scanner
            </Link>
            <Link href="/" className="btn btn-outline btn-sm">
              Public Site ↗
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}
