"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context";

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "📦", label: "My Parcels", href: "/parcels" },
  { icon: "🔍", label: "Track Parcel", href: "/dashboard?tab=track" },
  { icon: "👤", label: "My Account", href: "/account" },
  { icon: "⭐", label: "Membership", href: "/membership" },
  { icon: "❓", label: "Help Center", href: "/help" },
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
  const displayPlan = user?.plan || "PREMIUM";
  const displayCode = user?.residentCode || "CK-000123";
  const displayUnit = user?.unit ? `${user.unit} – ${user.tower || "Tower A"}` : "Unit 101 – Tower A";
  const building = "CK BUILDERSVILLE CONDOMINIUM";

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
    <div className="min-h-screen bg-brand-surface">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex items-center justify-between h-[64px]">
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Customer navigation">
            {[
              { label: "DASHBOARD", href: "/dashboard" },
              { label: "MY PARCELS", href: "/parcels", icon: "📦" },
              { label: "TRACK PARCEL", href: "/dashboard?tab=track", icon: "🔍" },
              { label: "MY ACCOUNT", href: "/account", icon: "👤" },
              { label: "STAFF TERMINAL", href: "/admin", icon: "🛡️" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  pathname === item.href || (item.href.startsWith("/dashboard") && pathname === "/dashboard")
                    ? "text-brand-red font-bold"
                    : "text-brand-text-secondary hover:text-brand-text"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

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

      <div className="max-w-[1440px] mx-auto flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-[260px] shrink-0 bg-white border-r border-brand-border min-h-[calc(100vh-64px)] sticky top-[64px]">
          {/* User card */}
          <div className="p-4">
            <div className="bg-brand-red rounded-xl p-4 text-white text-center">
              <div className="w-14 h-14 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-2 font-black text-lg">
                {initials}
              </div>
              <p className="font-bold text-sm">{displayName}</p>
              {user?.planStatus === "PENDING_PAYMENT" ? (
                <span className="inline-block bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full mt-1 uppercase animate-pulse">
                  {displayPlan.replace("_", " ")} (PENDING)
                </span>
              ) : (
                <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase">
                  {displayPlan.replace("_", " ")}
                </span>
              )}
              <p className="text-white/90 font-mono text-xs mt-1">{displayCode}</p>
            </div>
            <div className="bg-brand-dark rounded-b-xl p-3 text-white text-center -mt-1">
              <p className="text-xs font-medium">{displayUnit}</p>
              <p className="text-[10px] text-white/60 uppercase">{building}</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Customer sidebar">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-brand-red-light text-brand-red font-semibold"
                    : "text-brand-text-secondary hover:bg-brand-surface"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-brand-text-secondary hover:bg-brand-surface hover:text-brand-red cursor-pointer transition-colors"
            >
              <span className="text-base">🚪</span>
              Log Out
            </button>
          </nav>

          {/* Delivery CTA */}
          <div className="p-4">
            <div className="bg-brand-red-bg rounded-xl p-4 text-center">
              <p className="text-brand-red font-bold text-sm mb-1">NEED DOOR-TO-DOOR DELIVERY?</p>
              <p className="text-xs text-brand-text-secondary mb-3">We can deliver your parcel right to your unit!</p>
              <Link href="/parcels" className="btn btn-primary btn-sm w-full block text-center">
                REQUEST DELIVERY
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
            <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 lg:hidden overflow-y-auto shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-brand-border">
                <span className="font-bold text-sm">Menu</span>
                <button onClick={() => setDrawerOpen(false)} className="p-1" aria-label="Close menu">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="p-4">
                <div className="bg-brand-red rounded-xl p-4 text-white text-center mb-2">
                  <p className="font-bold text-sm">{displayName}</p>
                  {user?.planStatus === "PENDING_PAYMENT" ? (
                    <span className="inline-block bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full mt-1 uppercase animate-pulse">
                      {displayPlan.replace("_", " ")} (PENDING)
                    </span>
                  ) : (
                    <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase">
                      {displayPlan.replace("_", " ")}
                    </span>
                  )}
                  <p className="text-white/90 font-mono text-xs mt-1">{displayCode}</p>
                </div>
              </div>
              <nav className="px-3 space-y-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${
                      pathname === item.href
                        ? "bg-brand-red-light text-brand-red font-semibold"
                        : "text-brand-text-secondary"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-brand-text-secondary hover:text-brand-red"
                >
                  <span>🚪</span>
                  Log Out
                </button>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
