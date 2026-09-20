"use client";

import Link from "next/link";
import Image from "next/image";
import { FOOTER_QUICK_LINKS, SITE_CONFIG } from "@/constants";

export default function PublicFooter() {
  return (
    <footer id="contact" className="bg-brand-dark text-white scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-14 lg:py-18">
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:justify-between items-start gap-10 sm:gap-8 lg:gap-8 xl:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-auto w-full lg:max-w-xs xl:max-w-sm shrink-0">
            <Link href="/" className="inline-block mb-4 group select-none" aria-label="CK Condo Drop Hub Home">
              <Image
                src="/brand/logo-white.png"
                alt="CK Condo Drop Hub — Quick Drops, Easy Pick Ups"
                width={280}
                height={79}
                className="h-12 sm:h-14 lg:h-16 w-auto max-h-[64px] object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mb-5">
              Your trusted parcel and community service hub inside the condominium. Safe, fast, and convenient for every resident.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/ckcondrohub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="w-full sm:w-auto shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 lg:mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="w-full sm:w-auto shrink-0 max-w-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 lg:mb-5">
              Contact Us
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-brand-red shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span className="text-sm text-gray-400 font-medium">{SITE_CONFIG.contact.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-brand-red shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span className="text-sm text-gray-400">{SITE_CONFIG.contact.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 text-brand-red shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-sm text-gray-400 leading-relaxed">
                  {SITE_CONFIG.location.building}<br />
                  {SITE_CONFIG.location.street}, {SITE_CONFIG.location.city}
                </span>
              </li>
            </ul>
          </div>

          {/* Subscribe Column */}
          <div className="sm:col-span-2 lg:col-span-auto w-full sm:w-auto lg:w-64 xl:w-72 shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 lg:mb-5">
              Subscribe to Updates
            </h3>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Get the latest promos, holiday schedules, and community announcements.
            </p>
            <form className="flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-red min-w-0 transition-colors"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="w-full btn btn-primary py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider">
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © 2025 CK Condo Drop Hub. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Designed for a <span className="text-brand-red">Better Condo Community.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
