import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section id="home" className="relative bg-white overflow-hidden scroll-mt-28">
      {/* Storefront photo filling the curved background with smooth white gradient */}
      <div className="absolute top-0 right-0 h-full w-[54%] lg:w-[56%] xl:w-[58%] hidden lg:block pointer-events-none select-none z-0">
        <svg
          className="w-full h-full"
          viewBox="0 0 1150 700"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="heroCurveMask">
              <path d="M160,0 L1150,0 L1150,700 L160,700 Q0,350 160,0 Z" />
            </clipPath>
            <linearGradient id="heroWhiteFade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="15%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroPinkTint" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CC0000" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#CC0000" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Underlay pink curve border glow */}
          <path d="M158,0 L1150,0 L1150,700 L158,700 Q-2,350 158,0 Z" fill="#CC0000" opacity="0.08" />

          {/* Hub storefront image filling the full curved background (zoomed out) */}
          <g clipPath="url(#heroCurveMask)">
            <image
              href="/images/hub-exterior.png"
              xlinkHref="/images/hub-exterior.png"
              x="0"
              y="0"
              width="1150"
              height="700"
              preserveAspectRatio="xMidYMid slice"
            />
            {/* Subtle brand warmth tint */}
            <rect x="0" y="0" width="1150" height="700" fill="url(#heroPinkTint)" />
            {/* White gradient on the left side of the image */}
            <rect x="0" y="0" width="1150" height="700" fill="url(#heroWhiteFade)" />
          </g>
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[480px] lg:min-h-[560px]">
          {/* Left: Copy (Cols 1-7) */}
          <div className="lg:col-span-7 xl:col-span-6">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-text-secondary mb-3 font-bold">
              Your Condo. Your Convenience. Our Priority.
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6 font-black">
              YOUR TRUSTED<br />
              <span className="text-brand-red">PARCEL</span> HUB<br />
              <span className="text-2xl sm:text-4xl lg:text-5xl">INSIDE YOUR COMMUNITY</span>
            </h1>
            <p className="text-brand-text-secondary text-base lg:text-lg leading-relaxed mb-6 max-w-lg font-medium">
              We make receiving and sending parcels easy, secure, and hassle-free for everyone in the condo.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              {["Safe & Secure", "Fast & Convenient", "Affordable", "Community Focused"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 text-sm font-semibold text-brand-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="btn btn-primary btn-lg shadow-md hover:shadow-brand-red/25 transition-all text-center">
                SIGN UP NOW →
              </Link>
              <Link href="/#services" className="btn btn-outline btn-lg transition-all text-center">
                LEARN MORE
              </Link>
            </div>
          </div>

          {/* Right column: Spacer reserving area for background storefront showcase */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-6" />
        </div>

        {/* Mobile storefront photo */}
        <div className="lg:hidden mt-8">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-brand-border aspect-[16/10]">
            <Image
              src="/images/hub-exterior.png"
              alt="CK Condo Drop Hub storefront at C1 Buildersville Condominium"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/90 via-white/40 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
