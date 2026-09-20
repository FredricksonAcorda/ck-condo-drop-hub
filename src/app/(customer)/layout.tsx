"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "📦", label: "My Parcels", href: "/parcels" },
  { icon: "🔍", label: "Track Parcel", href: "/track" },
  { icon: "👤", label: "My Account", href: "/account" },
  { icon: "⭐", label: "Membership", href: "/membership" },
  { icon: "❓", label: "Help Center", href: "/help" },
];

const sampleUser = {
  name: "Juan Dela Cruz",
  plan: "PREMIUM",
  code: "CK-000123",
  unit: "Unit 101 – Tower A",
  building: "CK BUILDERSVILLE CONDOMINIUM",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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
              { label: "TRACK PARCEL", href: "/track", icon: "🔍" },
              { label: "MY ACCOUNT", href: "/account", icon: "👤" },
              { label: "CONTACT US", href: "/contact", icon: "📞" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  pathname === item.href
                    ? "text-brand-red"
                    : "text-brand-text-secondary hover:text-brand-text"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User area */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-brand-surface rounded-full" aria-label="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-brand-text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-red rounded-full text-[10px] text-white flex items-center justify-center">2</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-surface rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-brand-text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-tight">{sampleUser.name}</p>
                <p className="text-[11px] text-brand-text-secondary">{sampleUser.code}</p>
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
              <div className="w-14 h-14 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <p className="font-bold text-sm">{sampleUser.name}</p>
              <span className="inline-block bg-premium-cream text-premium-gold text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase">
                {sampleUser.plan}
              </span>
              <p className="text-white/80 text-xs mt-1">{sampleUser.code}</p>
            </div>
            <div className="bg-brand-dark rounded-b-xl p-3 text-white text-center -mt-1">
              <p className="text-xs font-medium">{sampleUser.unit}</p>
              <p className="text-[10px] text-white/60 uppercase">{sampleUser.building}</p>
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
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-brand-text-secondary hover:bg-brand-surface"
            >
              <span className="text-base">🚪</span>
              Log Out
            </Link>
          </nav>

          {/* Delivery CTA */}
          <div className="p-4">
            <div className="bg-brand-red-bg rounded-xl p-4 text-center">
              <p className="text-brand-red font-bold text-sm mb-1">NEED DOOR-TO-DOOR DELIVERY?</p>
              <p className="text-xs text-brand-text-secondary mb-3">We can deliver your parcel right to your unit!</p>
              <button className="btn btn-primary btn-sm w-full">REQUEST DELIVERY</button>
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
                  <p className="font-bold text-sm">{sampleUser.name}</p>
                  <span className="inline-block bg-premium-cream text-premium-gold text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase">{sampleUser.plan}</span>
                  <p className="text-white/80 text-xs mt-1">{sampleUser.code}</p>
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
