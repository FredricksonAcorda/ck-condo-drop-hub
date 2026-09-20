import Image from "next/image";
import Link from "next/link";

export default function CommunityBanner() {
  return (
    <section className="relative bg-brand-dark text-white py-16 lg:py-20 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/community.jpg"
          alt="Condo community"
          fill
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/65" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left: Headline & Button */}
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl leading-[1.05] mb-3">
              A MORE CONVENIENT<br />
              <span className="text-brand-red">CONDO COMMUNITY</span> TOGETHER.
            </h2>
            <p className="text-white/90 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
              Reliable parcel handling and essential services, right at your doorstep.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg shadow-sm">
              JOIN NOW →
            </Link>
          </div>

          {/* Right: 3 Value items with vertical dividers */}
          <div className="flex items-center justify-start lg:justify-end gap-6 sm:gap-10 flex-wrap">
            <div className="flex flex-col items-center text-center gap-2">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">For Residents</span>
            </div>

            <div className="hidden sm:block w-px h-14 bg-white/30" />

            <div className="flex flex-col items-center text-center gap-2">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
              <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">For a Safer Community</span>
            </div>

            <div className="hidden sm:block w-px h-14 bg-white/30" />

            <div className="flex flex-col items-center text-center gap-2">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="text-xs sm:text-sm text-white font-semibold whitespace-nowrap">For a Better Living</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
