"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PillNav from "@/components/ui/PillNav";

// Strictly the 5 requested sections: Home, Services, Pricing & Plans, About Us, and Contact Us
const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Pricing & Plans", href: "/#pricing" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("home");

  // Scroll spy: Strictly tracks the 5 sections in order
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = ["home", "services", "pricing", "about", "contact"];

    const handleScroll = () => {
      // If scrolled close to the bottom of page, activate the last section (Contact Us)
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (isAtBottom) {
        setActiveSection("contact");
        return;
      }

      let current = sectionIds[0];
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Header height is ~88px; when top of section crosses ~160px from viewport top, activate it
          if (rect.top <= 160) {
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

  const activeHref = pathname === "/" ? `/#${activeSection}` : pathname;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[76px] sm:h-[82px] lg:h-[88px]">
          {/* PillNav containing circular rotating brand logo, 5 pill links, and mobile drawer */}
          <div className="flex-1 min-w-0 pr-2 lg:pr-6">
            <PillNav
              logo="/brand/logo-mark.webp"
              logoAlt="CK Condo Drop Hub"
              items={navItems}
              activeHref={activeHref}
              ease="power2.easeOut"
              baseColor="#CC0000"
              pillColor="#ffffff"
              hoveredPillTextColor="#ffffff"
              pillTextColor="#07100D"
              logoBg="#ffffff"
              initialLoadAnimation={false}
              extraMobileContent={
                <div className="flex gap-2.5">
                  <Link
                    href="/login"
                    className="btn btn-outline btn-sm flex-1 justify-center text-xs"
                  >
                    LOG IN
                  </Link>
                  <Link
                    href="/register"
                    className="btn btn-primary btn-sm flex-1 justify-center text-xs"
                  >
                    SIGN UP
                  </Link>
                </div>
              }
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 ml-4">
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
        </div>
      </div>
    </header>
  );
}
