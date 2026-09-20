"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  variant?: 'default' | 'primary';
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  authItems?: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  logoBg?: string;
  onMobileMenuClick?: () => void;
  onItemClick?: (href: string) => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  authItems = [],
  activeHref,
  className = '',
  ease = 'power2.easeOut',
  baseColor = '#CC0000',
  pillColor = '#ffffff',
  hoveredPillTextColor = '#ffffff',
  pillTextColor = '#07100D',
  logoBg = '#ffffff',
  onMobileMenuClick,
  onItemClick,
  initialLoadAnimation = false,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Combine all items for GSAP indexing so both sections and auth pills have the exact same effect
  const allItems = React.useMemo(() => [...items, ...authItems], [items, authItems]);

  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);
        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0 });
        gsap.to(logoEl, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [allItems, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.35,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href: string) =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:');

  const isRouterLink = (href?: string) => !!href && !isExternalLink(href);

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor,
    ['--nav-h']: '44px',
    ['--logo']: '38px',
    ['--pill-pad-x']: '16px',
    ['--pill-gap']: '3px'
  } as React.CSSProperties;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onItemClick) {
      onItemClick(href);
    }
    if (href.startsWith('/#') && typeof window !== 'undefined') {
      const id = href.replace('/#', '');
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
      }
    }
  };

  const basePillClasses =
    'relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer px-0 select-none transition-colors';

  // Helper to render an individual pill button with GSAP animations
  const renderPillItem = (item: PillNavItem, globalIndex: number, isAuth = false) => {
    const isActive =
      !isAuth &&
      (activeHref === item.href ||
        activeHref === item.href.replace('/#', '') ||
        (activeHref === '/' && item.href === '/#home'));

    const isPrimary = item.variant === 'primary';

    // Style adjustments for primary CTA pills (e.g. Sign Up) vs default pills
    const pillStyle: React.CSSProperties = {
      background: isPrimary ? '#CC0000' : 'var(--pill-bg, #fff)',
      color: isPrimary ? '#ffffff' : 'var(--pill-text, var(--base, #07100D))',
      paddingLeft: 'var(--pill-pad-x)',
      paddingRight: 'var(--pill-pad-x)',
      border: isPrimary ? '1px solid #CC0000' : '1px solid rgba(0,0,0,0.06)'
    };

    const bubbleBg = isPrimary ? '#07100D' : 'var(--base, #CC0000)';
    const hoverTextColor = '#ffffff';

    const PillContent = (
      <>
        <span
          className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
          style={{
            background: bubbleBg,
            willChange: 'transform'
          }}
          aria-hidden="true"
          ref={el => {
            circleRefs.current[globalIndex] = el;
          }}
        />
        <span className="label-stack relative inline-block leading-[1] z-[2]">
          <span
            className="pill-label relative z-[2] inline-block leading-[1]"
            style={{ willChange: 'transform' }}
          >
            {item.label}
          </span>
          <span
            className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
            style={{
              color: hoverTextColor,
              willChange: 'transform, opacity'
            }}
            aria-hidden="true"
          >
            {item.label}
          </span>
        </span>
        {isActive && (
          <span
            className="absolute left-1/2 bottom-[3px] -translate-x-1/2 w-1.5 h-1.5 rounded-full z-[4] shadow-xs"
            style={{ background: 'var(--base, #CC0000)' }}
            aria-hidden="true"
          />
        )}
      </>
    );

    return (
      <li key={item.href} role="none" className="flex h-full">
        {isRouterLink(item.href) ? (
          <Link
            role="menuitem"
            href={item.href}
            className={basePillClasses}
            style={pillStyle}
            aria-label={item.ariaLabel || item.label}
            onMouseEnter={() => handleEnter(globalIndex)}
            onMouseLeave={() => handleLeave(globalIndex)}
            onClick={(e) => handleLinkClick(e, item.href)}
          >
            {PillContent}
          </Link>
        ) : (
          <a
            role="menuitem"
            href={item.href}
            className={basePillClasses}
            style={pillStyle}
            aria-label={item.ariaLabel || item.label}
            onMouseEnter={() => handleEnter(globalIndex)}
            onMouseLeave={() => handleLeave(globalIndex)}
            onClick={(e) => handleLinkClick(e, item.href)}
          >
            {PillContent}
          </a>
        )}
      </li>
    );
  };

  return (
    <div className={`relative z-[100] ${className}`}>
      {/* Floating Pill Capsule Bar */}
      <nav
        className="flex items-center box-border p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-brand-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
        aria-label="Primary"
        style={cssVars}
      >
        {/* Logo Icon (Spins on Hover) */}
        <Link
          href={items?.[0]?.href || '/'}
          aria-label={logoAlt}
          onMouseEnter={handleLogoEnter}
          onClick={(e) => handleLinkClick(e, items?.[0]?.href || '/')}
          role="menuitem"
          ref={logoRef}
          className="rounded-full p-2 inline-flex items-center justify-center overflow-hidden shrink-0 border border-brand-border/80 shadow-xs hover:shadow-sm transition-shadow group"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: logoBg
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={logoAlt}
            ref={logoImgRef}
            className="w-full h-full object-contain block select-none"
          />
        </Link>

        {/* Desktop Nav Items */}
        <div
          ref={navItemsRef}
          className="relative items-center rounded-full hidden lg:flex ml-2"
          style={{
            height: 'var(--nav-h)'
          }}
        >
          <ul
            role="menubar"
            className="list-none flex items-stretch m-0 p-0 h-full"
            style={{ gap: 'var(--pill-gap)' }}
          >
            {/* 5 Sections */}
            {items.map((item, i) => renderPillItem(item, i, false))}

            {/* Subtle Divider before Auth Buttons */}
            {authItems.length > 0 && (
              <li
                role="separator"
                aria-orientation="vertical"
                className="w-px h-5 self-center bg-brand-border/80 mx-1.5 shrink-0"
              />
            )}

            {/* Auth Buttons using the EXACT same UI button navigation */}
            {authItems.map((item, j) =>
              renderPillItem(item, items.length + j, true)
            )}
          </ul>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          ref={hamburgerRef}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="lg:hidden ml-2 rounded-full border border-brand-border/70 flex flex-col items-center justify-center gap-1.5 cursor-pointer p-0 relative shadow-xs hover:bg-brand-surface transition-colors"
          style={{
            width: 'var(--nav-h)',
            height: 'var(--nav-h)',
            background: 'var(--pill-bg, #fff)'
          }}
        >
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--base, #07100D)' }}
          />
          <span
            className="hamburger-line w-4 h-0.5 rounded origin-center transition-all duration-[10ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ background: 'var(--base, #07100D)' }}
          />
        </button>
      </nav>

      {/* Mobile Drawer Dropdown (Floating card) */}
      <div
        ref={mobileMenuRef}
        className="lg:hidden absolute top-[3.8em] left-0 right-0 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.18)] z-[998] origin-top p-3 border border-brand-border bg-white/98 backdrop-blur-lg"
        style={cssVars}
      >
        <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
          {items.map(item => {
            const isActive =
              activeHref === item.href ||
              activeHref === item.href.replace('/#', '') ||
              (activeHref === '/' && item.href === '/#home');

            const defaultStyle: React.CSSProperties = {
              background: isActive ? 'var(--base, #CC0000)' : 'var(--pill-bg, #f7f9fa)',
              color: isActive ? '#ffffff' : 'var(--pill-text, #07100D)'
            };

            const linkClasses =
              'block py-3 px-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200';

            return (
              <li key={item.href}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onClick={(e) => {
                      handleLinkClick(e, item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={linkClasses}
                    style={defaultStyle}
                    onClick={(e) => {
                      handleLinkClick(e, item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}

          {/* Auth Pill Buttons in Mobile Menu */}
          {authItems.length > 0 && (
            <li className="pt-2 mt-1 border-t border-brand-border/60 flex gap-2">
              {authItems.map((authItem) => {
                const isPrimary = authItem.variant === 'primary';
                return (
                  <Link
                    key={authItem.href}
                    href={authItem.href}
                    onClick={(e) => {
                      handleLinkClick(e, authItem.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-2.5 px-3 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                      isPrimary
                        ? 'bg-brand-red text-white shadow-xs hover:bg-brand-red-hover'
                        : 'bg-brand-surface text-brand-text border border-brand-border hover:bg-gray-100'
                    }`}
                  >
                    {authItem.label}
                  </Link>
                );
              })}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
