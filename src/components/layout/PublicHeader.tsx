"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavLink {
  id: string;
  label: string;
  href: string;
}

// Strictly consecutive station sections in sequential scroll order
const consecutiveNavLinks: NavLink[] = [
  { id: "home", label: "Home", href: "/#home" },
  { id: "services", label: "Services", href: "/#services" },
  { id: "how-it-works", label: "How It Works", href: "/#how-it-works" },
  { id: "pricing", label: "Pricing & Plans", href: "/#pricing" },
  { id: "about", label: "About Us", href: "/#about" },
  { id: "announcements", label: "Announcements", href: "/#announcements" },
  { id: "contact", label: "Contact Us", href: "/#contact" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  // Scroll spy: Strictly tracks consecutive station sections as user scrolls down
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = consecutiveNavLinks.map((item) => item.id);

    const handleScroll = () => {
      // If scrolled to the bottom of the page, highlight the last section (Contact Us)
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
      if (isAtBottom) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current = sectionIds[0];
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Header height is 100px; when top of section crosses 165px from viewport top, activate it
          if (rect.top <= 165) {
            current = sectionIds[i];
          }
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const id = href.replace("/#", "");
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
        setMobileOpen(false);
      }
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[88px] sm:h-[94px] lg:h-[100px]">
          {/* Big, Clear, Easily Readable Brand Logo */}
          <Link
            href="/#home"
            onClick={(e) => scrollToSection(e, "/#home")}
            className="flex items-center shrink-0 py-2 mr-3 lg:mr-4 xl:mr-8 group select-none"
            aria-label="CK Condo Drop Hub Home"
          >
            <Image
              src="/brand/logo.webp"
              alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
              width={320}
              height={90}
              className="h-14 sm:h-16 lg:h-[72px] w-auto max-h-[72px] object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Desktop Nav in strictly consecutive section order (Balanced for zero overlap) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0" aria-label="Main navigation">
            {consecutiveNavLinks.map((link) => {
              const isActive = pathname === "/" ? activeSection === link.id : pathname === link.href;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`px-2 xl:px-3 py-2 text-[11px] xl:text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "text-brand-red bg-brand-red-bg font-black"
                      : "text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 ml-2">
            <Link
              href="/login"
              className="btn btn-outline btn-sm whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              LOG IN
            </Link>
            <Link
              href="/register"
              className="btn btn-primary btn-sm whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              SIGN UP
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2.5 rounded-md hover:bg-brand-surface transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-border bg-white shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
            {consecutiveNavLinks.map((link) => {
              const isActive = pathname === "/" ? activeSection === link.id : pathname === link.href;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-brand-red bg-brand-red-bg font-bold"
                      : "text-brand-text-secondary hover:bg-brand-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-4 flex gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline flex-1 justify-center">
              LOG IN
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary flex-1 justify-center">
              SIGN UP
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
