"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "My Parcels", href: "/parcels" },
  { label: "My Account", href: "/account" },
  { label: "Membership", href: "/membership" },
  { label: "Help Center", href: "/help" },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchDemoUser } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName = user?.name || "Juan Dela Cruz";
  const displayCode = user?.residentCode || "CK-000123";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="h-screen bg-brand-surface flex flex-col overflow-hidden">
      {/* Top Header (Clean: Logo & User Status Only, No Duplicate Nav) */}
      <header className="shrink-0 z-50 bg-white border-b border-brand-border shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[64px]">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-brand-surface"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 py-1">
            <Image
              src="/brand/logo.webp"
              alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
              width={240}
              height={68}
              className="h-10 w-auto max-h-[40px] object-contain select-none"
              priority
            />
          </Link>

          {/* User area */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs">
              <span className="text-brand-text-muted text-[11px]">Demo:</span>
              <button
                type="button"
                onClick={() => switchDemoUser("usr-resident-1")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  user?.id === "usr-resident-1"
                    ? "bg-brand-red text-white border-brand-red"
                    : "bg-brand-surface text-brand-text border-brand-border hover:bg-gray-100"
                }`}
                title="Switch to Juan Dela Cruz (Premium)"
              >
                Juan (Prem)
              </button>
              <button
                type="button"
                onClick={() => switchDemoUser("usr-resident-2")}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  user?.id === "usr-resident-2"
                    ? "bg-brand-red text-white border-brand-red"
                    : "bg-brand-surface text-brand-text border-brand-border hover:bg-gray-100"
                }`}
                title="Switch to Maria Santos (Regular)"
              >
                Maria (Reg)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-red text-white font-bold text-xs rounded-full flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-[11px] text-brand-text-secondary font-mono">{displayCode}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full flex-1 flex overflow-hidden">
        {/* Sidebar (desktop): All tabs/buttons only, with logout pinned to bottom */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-white border-r border-brand-border h-full justify-between">
          {/* Nav items only */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Customer sidebar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? "bg-brand-red-light text-brand-red font-bold"
                    : "text-brand-text-secondary hover:bg-brand-surface hover:text-brand-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Resident Identity Block & Logout pinned at bottom */}
          <div className="p-4 border-t border-brand-border bg-brand-surface flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div>
                <p className="text-xs font-bold text-brand-black leading-tight">{displayName}</p>
                <p className="text-[10px] text-brand-text-secondary font-mono">{displayCode}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-brand-text-secondary hover:text-brand-red transition-colors text-xs font-bold uppercase cursor-pointer"
              title="Log Out"
            >
              LOGOUT
            </button>
          </div>
        </aside>

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 lg:hidden overflow-y-auto shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between p-4 border-b border-brand-border">
                  <span className="font-bold text-sm">Navigation Menu</span>
                  <button onClick={() => setDrawerOpen(false)} className="p-1" aria-label="Close menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <nav className="p-3 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold ${
                        pathname === item.href
                          ? "bg-brand-red-light text-brand-red font-bold"
                          : "text-brand-text-secondary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Logout pinned at bottom */}
              <div className="p-4 border-t border-brand-border bg-brand-surface flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-black leading-tight">{displayName}</p>
                    <p className="text-[10px] text-brand-text-secondary font-mono">{displayCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  className="text-brand-text-secondary hover:text-brand-red transition-colors text-xs font-bold uppercase cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
