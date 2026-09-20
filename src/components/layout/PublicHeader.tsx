"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PillNav, { PillNavItem } from "@/components/ui/PillNav";

// Strictly the 5 requested sections: Home, Services, Pricing & Plans, About Us, and Contact Us
const navItems: PillNavItem[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Pricing & Plans", href: "/#pricing" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#contact" },
];

// Auth actions using the exact same UI button navigation
const authItems: PillNavItem[] = [
  { label: "LOG IN", href: "/login" },
  { label: "SIGN UP", href: "/register", variant: "primary" },
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
          // When top of section crosses ~160px from viewport top, activate it
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
    // Floating navigation header centered in the viewport with no full-width background
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 pointer-events-none px-3 sm:px-6 flex items-center justify-center">
      <div className="pointer-events-auto max-w-full">
        <PillNav
          logo="/brand/logo-mark.webp"
          logoAlt="CK Condo Drop Hub"
          items={navItems}
          authItems={authItems}
          activeHref={activeHref}
          ease="power2.easeOut"
          baseColor="#CC0000"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#07100D"
          logoBg="#ffffff"
          initialLoadAnimation={false}
        />
      </div>
    </header>
  );
}
