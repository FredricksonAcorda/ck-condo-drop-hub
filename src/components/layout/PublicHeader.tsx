"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import PillNav from "@/components/ui/PillNav";
import { PUBLIC_NAV_ITEMS, AUTH_NAV_ITEMS } from "@/constants";

export default function PublicHeader() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string>("");

  // Scroll spy: Tracks sections in scroll order
  useEffect(() => {
    if (pathname !== "/") return;

    const sectionIds = ["services", "pricing", "about", "contact"];

    const handleScroll = () => {
      // If near the top (Home hero section), no inner pill is active (logo is Home)
      if (window.scrollY < 180) {
        setActiveSection("");
        return;
      }

      // If scrolled close to the bottom of page, activate the last section (Contact Us)
      const isAtBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (isAtBottom) {
        setActiveSection("contact");
        return;
      }

      let current = "";
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

  const activeHref = pathname === "/" ? (activeSection ? `/#${activeSection}` : "") : pathname;

  return (
    // Floating navigation header centered in the viewport with no full-width background
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 pointer-events-none px-3 sm:px-6 flex items-center justify-center">
      <div className="pointer-events-auto max-w-full">
        <PillNav
          logo="/brand/logo-mark.webp"
          logoAlt="CK Condo Drop Hub Home"
          logoHref="/#home"
          items={PUBLIC_NAV_ITEMS}
          authItems={AUTH_NAV_ITEMS}
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
