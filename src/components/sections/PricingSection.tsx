import Link from "next/link";

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-brand-surface py-16 lg:py-20 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: Membership Plans Red Header Card */}
          <div className="bg-brand-red text-white rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col justify-between h-full">
            {/* Header with Crown & Title */}
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="2" cy="7" r="1.5" />
                    <circle cx="7" cy="9.5" r="1.5" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="17" cy="9.5" r="1.5" />
                    <circle cx="22" cy="7" r="1.5" />
                    <path d="M2.5 9 L5 17 H19 L21.5 9 L15.5 13.5 L12 7.5 L8.5 13.5 Z" />
                    <rect x="5" y="18" width="14" height="2.5" rx="1" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl leading-none font-bold tracking-wide">
                    MEMBERSHIP<br />PLANS
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed pl-0.5">
                Choose the plan that fits your lifestyle.
              </p>
            </div>

            {/* Feature Checkmarks - Evenly spaced to fill card height */}
            <ul className="flex-1 flex flex-col justify-around py-6 space-y-4 my-auto">
              {[
                "More Convenience",
                "Priority Handling",
                "Affordable Rates",
                "Designed for Condo Residents",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-xs sm:text-sm font-semibold tracking-wide">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-3.5 h-3.5 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Bottom Community Highlight */}
            <div className="pt-4 border-t border-white/20 text-center text-[11px] font-semibold text-white/85 uppercase tracking-wider">
              Doorstep Convenience Inside CK
            </div>
          </div>

          {/* Card 2: Per Parcel */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-brand-border shadow-sm flex flex-col justify-between h-full text-center relative hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              {/* Icon (Row 1) */}
              <div className="h-14 mb-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center text-white shadow-sm">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                </div>
              </div>

              {/* Title (Row 2) */}
              <div className="h-8 flex items-center justify-center mb-1">
                <h4 className="font-bold text-lg sm:text-xl text-brand-text">Per Parcel</h4>
              </div>

              {/* Price (Row 3) */}
              <div className="h-14 flex items-center justify-center my-2">
                <div className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl font-bold text-brand-red leading-none">
                  ₱15
                </div>
              </div>

              {/* Duration / Quota (Row 4) */}
              <div className="h-10 flex items-center justify-center text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-text leading-tight">
                PER PARCEL
              </div>

              {/* Feature / Holding Tag (Row 5) */}
              <div className="h-24 flex flex-col justify-center items-center my-4 w-full">
                <div className="text-brand-text font-bold text-xs uppercase tracking-wider">
                  3 DAYS FREE HOLDING
                </div>
              </div>
            </div>

            {/* CTA Button (Row 6) */}
            <div className="mt-auto pt-2 w-full">
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border-2 border-brand-red text-brand-red bg-white hover:bg-brand-red hover:text-white transition-colors block shadow-sm"
              >
                SELECT PLAN
              </Link>
            </div>
          </div>

          {/* Card 3: Regular Plan */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-brand-border shadow-sm flex flex-col justify-between h-full text-center relative hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              {/* Icon (Row 1) */}
              <div className="h-14 mb-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-red flex items-center justify-center text-white shadow-sm">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="8" cy="14" r="1" fill="currentColor" />
                    <circle cx="12" cy="14" r="1" fill="currentColor" />
                    <circle cx="16" cy="14" r="1" fill="currentColor" />
                    <circle cx="8" cy="18" r="1" fill="currentColor" />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                    <circle cx="16" cy="18" r="1" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Title (Row 2) */}
              <div className="h-8 flex items-center justify-center mb-1">
                <h4 className="font-bold text-lg sm:text-xl text-brand-text">Regular Plan</h4>
              </div>

              {/* Price (Row 3) */}
              <div className="h-14 flex items-center justify-center my-2">
                <div className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl font-bold text-brand-red leading-none">
                  ₱149
                </div>
              </div>

              {/* Duration / Quota (Row 4) */}
              <div className="h-10 flex items-center justify-center text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-text leading-tight text-center">
                15 DAYS<br />UNLIMITED PARCELS
              </div>

              {/* Feature / Holding Tag (Row 5) */}
              <div className="h-24 flex flex-col justify-center items-center my-4 w-full">
                <div className="text-brand-text font-bold text-xs uppercase tracking-wider">
                  3 DAYS FREE HOLDING
                </div>
              </div>
            </div>

            {/* CTA Button (Row 6) */}
            <div className="mt-auto pt-2 w-full">
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border-2 border-brand-red text-brand-red bg-white hover:bg-brand-red hover:text-white transition-colors block shadow-sm"
              >
                SELECT PLAN
              </Link>
            </div>
          </div>

          {/* Card 4: Premium Plan */}
          <div className="bg-[#FCF8EE] rounded-2xl p-6 sm:p-7 border-2 border-[#E5A824] shadow-md flex flex-col justify-between h-full text-center relative hover:shadow-lg transition-shadow">
            {/* Best Value Badge */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[11px] font-bold px-4 py-1 rounded-md tracking-wider shadow-sm uppercase whitespace-nowrap">
              BEST VALUE!
            </span>

            <div className="flex flex-col items-center">
              {/* Icon (Row 1) */}
              <div className="h-14 mb-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[#DA9A26] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="2" cy="7" r="1.5" />
                    <circle cx="7" cy="9.5" r="1.5" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="17" cy="9.5" r="1.5" />
                    <circle cx="22" cy="7" r="1.5" />
                    <path d="M2.5 9 L5 17 H19 L21.5 9 L15.5 13.5 L12 7.5 L8.5 13.5 Z" />
                    <rect x="5" y="18" width="14" height="2.5" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Title (Row 2) */}
              <div className="h-8 flex items-center justify-center mb-1">
                <h4 className="font-bold text-lg sm:text-xl text-brand-red">Premium Plan</h4>
              </div>

              {/* Price (Row 3) */}
              <div className="h-14 flex items-center justify-center my-2">
                <div className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl font-bold text-brand-red leading-none">
                  ₱299
                </div>
              </div>

              {/* Duration / Quota (Row 4) */}
              <div className="h-10 flex items-center justify-center text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-text leading-tight text-center">
                30 DAYS<br />UNLIMITED PARCELS
              </div>

              {/* Feature / Holding Tag (Row 5) */}
              <div className="h-24 flex flex-col justify-center items-center my-4 w-full">
                <ul className="space-y-2 text-left mx-auto w-fit">
                  <li className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase text-brand-text">
                    <span className="w-4 h-4 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>7 DAYS HOLDING PERIOD</span>
                  </li>
                  <li className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase text-brand-text">
                    <span className="w-4 h-4 rounded-full bg-brand-red flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>5 FREE DOOR-TO-DOOR DELIVERY</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button (Row 6) */}
            <div className="mt-auto pt-2 w-full">
              <Link
                href="/register"
                className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border-2 border-brand-red text-brand-red bg-white hover:bg-brand-red hover:text-white transition-colors block shadow-sm"
              >
                SELECT PLAN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
