"use client";

import Link from "next/link";
import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Pricing & Plans", href: "/#pricing" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Contact Us", href: "/#contact" },
  { label: "FAQs", href: "/#pricing" },
];

export default function PublicFooter() {
  return (
    <footer id="contact" className="bg-brand-dark text-white scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-0 lg:divide-x divide-white/15">
          {/* Column 1: Brand with authentic white card logo */}
          <div className="lg:pr-6">
            <Link href="/" className="inline-block mb-3 group select-none" aria-label="CK Condo Drop Hub Home">
              <div className="bg-white rounded-md p-2 sm:p-2.5 inline-block shadow-md border border-white/20">
                <Image
                  src="/brand/logo.webp"
                  alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
                  width={260}
                  height={81}
                  className="h-12 sm:h-14 w-auto object-contain select-none"
                />
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xs mb-4">
              Your trusted parcel and community service hub inside the condominium.
            </p>
            {/* Social Icons matching client screenshot: 3 white circular buttons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/ckcondodrophub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-black hover:opacity-90 transition-opacity shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://m.me/ckcondodrophub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Messenger"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-black hover:opacity-90 transition-opacity shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.23.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.556-6.963 3.13 3.259 5.889-3.259-6.556 6.963z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@ckcondodrophub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-black hover:opacity-90 transition-opacity shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:px-6">
            <h3 className="text-sm font-bold tracking-wider mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Store Hours (Beside Quick Links) */}
          <div className="lg:px-6">
            <h3 className="text-sm font-bold tracking-wider mb-4 text-white">Store Hours</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-brand-red flex items-center justify-center shrink-0 mt-0.5 text-brand-red">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">Mon - Fri</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">10:00 AM - 10:00 PM</p>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <p className="text-sm font-bold text-white leading-tight">Sat & Sun</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">10:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Red holiday notice banner */}
              <div className="bg-brand-red text-white rounded-md p-2.5 sm:p-3 flex items-start gap-2.5 text-xs font-semibold shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5 stroke-current" fill="none" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span className="leading-snug">We are closed on holidays unless otherwise announced.</span>
              </div>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:px-6">
            <h3 className="text-sm font-bold tracking-wider mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                </svg>
                <span className="text-xs sm:text-sm text-gray-300 font-medium">0956 345 4219</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-xs sm:text-sm text-gray-300 font-medium break-all">ckcondodrophub@gmail.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="text-xs sm:text-sm text-gray-300 leading-snug">
                  C1 Buildersville Condominium<br />
                  Marindal Rincon, Valenzuela City
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Subscribe to Updates */}
          <div className="lg:pl-6">
            <h3 className="text-sm font-bold tracking-wider mb-4 text-white">Subscribe to Updates</h3>
            <form className="space-y-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white text-brand-black placeholder:text-gray-400 rounded-md px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-red font-medium"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="w-full bg-brand-red hover:bg-[#b30000] text-white font-bold py-2.5 px-4 rounded-md uppercase tracking-wider text-xs sm:text-sm transition-colors shadow-sm cursor-pointer"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright & Tagline with Red Accent Line */}
      <div className="border-t border-white/15">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400 font-medium">
            © 2025 CK Condo Drop Hub. All rights reserved.
          </p>
          <div className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
            <span>Designed for a Better</span>
            <span className="relative font-semibold text-white">
              Condo Community.
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-brand-red rounded-full" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
