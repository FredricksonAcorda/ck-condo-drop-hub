"use client";

import Link from "next/link";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 pointer-events-none px-4 sm:px-6 flex items-center justify-center">
      <div className="pointer-events-auto flex items-center p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] gap-2">
        {/* Animated Brand Logo Mark (Non-clickable, spins 360° on hover) */}
        <div
          role="img"
          aria-label="CK Condo Drop Hub"
          className="w-10 h-10 rounded-full p-2 bg-white border border-gray-200/80 shadow-xs flex items-center justify-center select-none group cursor-default"
          title="CK Condo Drop Hub"
        >
          <Image
            src="/brand/logo-mark.webp"
            alt="CK Logo"
            width={32}
            height={32}
            unoptimized
            priority
            className="w-full h-full object-contain block select-none transition-transform duration-500 ease-out group-hover:rotate-[360deg]"
          />
        </div>

        {/* Home Navigation Button */}
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#07100D] hover:text-white bg-white hover:bg-brand-red border border-gray-200/80 hover:border-brand-red transition-all duration-300 shadow-2xs group cursor-pointer select-none"
        >
          <span>Home</span>
        </Link>
      </div>
    </header>
  );
}
