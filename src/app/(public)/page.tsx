import Image from "next/image";
import Link from "next/link";
import LogoLoop, { LogoItem } from "@/components/ui/LogoLoop";
import FAQAccordion, { FAQItem } from "@/components/ui/FAQAccordion";

/* ------------------------------------------------------------------ */
/*  Section 1: Hero                                                    */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section id="home" className="relative bg-white overflow-hidden scroll-mt-28">
      {/* Red curved overlay (matching the client's distinctive red wave) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="absolute top-0 right-0 h-full w-[55%] hidden lg:block" viewBox="0 0 600 700" preserveAspectRatio="none">
          <path d="M100,0 L600,0 L600,700 L100,700 Q0,350 100,0 Z" fill="#CC0000" opacity="0.06" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Copy */}
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-text-secondary mb-3">
              Your Condo. Your Convenience. Our Priority.
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
              YOUR TRUSTED<br />
              <span className="text-brand-red">PARCEL</span> HUB<br />
              <span className="text-3xl sm:text-4xl lg:text-5xl">INSIDE YOUR COMMUNITY</span>
            </h1>
            <p className="text-brand-text-secondary text-base lg:text-lg leading-relaxed mb-6 max-w-lg">
              We make receiving and sending parcels easy, secure, and hassle-free for everyone in the condo.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              {["Safe & Secure", "Fast & Convenient", "Affordable", "Community Focused"].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 text-sm text-brand-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn btn-primary btn-lg">
                SIGN UP NOW →
              </Link>
              <Link href="/#services" className="btn btn-outline btn-lg">
                LEARN MORE
              </Link>
            </div>
          </div>

          {/* Right: Real hub storefront photo + benefit panel */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-brand-border">
              <Image
                src="/images/hub-exterior.png"
                alt="CK Condo Drop Hub physical storefront at C1 Buildersville Condominium"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Benefit panel (floating card on desktop) */}
            <div className="mt-6 lg:absolute lg:-right-4 lg:top-4 lg:w-64 bg-white rounded-xl shadow-lg border border-brand-border p-5 space-y-4">
              {[
                { icon: "📦", title: "Receive Parcels", desc: "We accept parcels from your favorite couriers." },
                { icon: "🕐", title: "Pick Up Anytime", desc: "Pick up your parcels at your convenience." },
                { icon: "🚪", title: "Door-to-Door Delivery", desc: "Enjoy door-to-door delivery with our premium plan." },
                { icon: "🔒", title: "Safe & Secure", desc: "Your parcels are safe with us until you pick them up." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-red-bg rounded-full flex items-center justify-center shrink-0 text-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">{item.title}</h3>
                    <p className="text-xs text-brand-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2: Courier Partners (Full-width LogoLoop Marquee)          */
/* ------------------------------------------------------------------ */
const courierLogos: LogoItem[] = [
  {
    node: (
      <div className="flex items-center justify-center px-7 sm:px-9 py-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:border-brand-red/30 transition-all cursor-pointer">
        <div className="flex flex-col items-center">
          <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-[#EE4D2D] leading-none select-none">
            SPX
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EE4D2D] mt-0.5 border-b-2 border-[#EE4D2D] pb-0.5 select-none">
            EXPRESS
          </span>
        </div>
      </div>
    ),
    title: "SPX Express",
    ariaLabel: "SPX Express Courier Partner"
  },
  {
    node: (
      <div className="flex items-center justify-center px-7 sm:px-9 py-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:border-brand-red/30 transition-all cursor-pointer">
        <div className="flex items-center text-3xl sm:text-4xl font-black italic text-[#D21F1F] tracking-tight select-none">
          <span>J&amp;T</span>
          <span className="text-2xl sm:text-3xl font-extrabold ml-1.5 italic tracking-normal">EXPRESS</span>
        </div>
      </div>
    ),
    title: "J&T Express",
    ariaLabel: "J&T Express Courier Partner"
  },
  {
    node: (
      <div className="flex items-center justify-center px-7 sm:px-9 py-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:border-brand-red/30 transition-all cursor-pointer">
        <div className="flex items-center text-3xl sm:text-4xl font-black italic text-black select-none">
          <span>FL</span>
          <span className="text-[#FFD600] inline-block -mx-0.5 transform -skew-x-6 text-3xl sm:text-4xl font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">⚡</span>
          <span>SH</span>
          <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-black ml-1.5 not-italic">
            EXPRESS
          </span>
        </div>
      </div>
    ),
    title: "Flash Express",
    ariaLabel: "Flash Express Courier Partner"
  }
];

function CourierStrip() {
  return (
    <section className="bg-brand-surface py-10 sm:py-12 border-y border-brand-border/60 overflow-hidden w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-text-secondary mb-1.5">
          Fast &amp; Reliable Delivery Network
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-brand-text uppercase">
          OUR PARTNER <span className="text-brand-red">COURIERS</span>
        </h2>
      </div>

      {/* Full-width infinite continuous loop */}
      <div className="w-full relative overflow-hidden py-2">
        <LogoLoop
          logos={courierLogos}
          speed={65}
          direction="left"
          gap={48}
          logoHeight={68}
          pauseOnHover={true}
          scaleOnHover={true}
          fadeOut={true}
          fadeOutColor="#F7F9FA"
          ariaLabel="Our Partner Couriers"
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3: Our Services                                            */
/* ------------------------------------------------------------------ */
function ServicesSection() {
  const services = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      ),
      title: "Parcel Receiving",
      desc: (
        <>
          We accept parcels from <strong className="font-bold text-brand-text">Shopee</strong>, <strong className="font-bold text-brand-text">J&amp;T</strong>, <strong className="font-bold text-brand-text">Flash</strong> and other couriers.
        </>
      ),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      ),
      title: "Parcel Pick Up",
      desc: (
        <>
          Claim your parcels <strong className="font-bold text-brand-text">anytime</strong> within our <strong className="font-bold text-brand-text">daily operating hours</strong>.
        </>
      ),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      ),
      title: "Door-to-Door Delivery",
      desc: (
        <>
          Direct doorstep delivery, <strong className="font-bold text-brand-red">exclusive for premium members</strong>.
        </>
      ),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      ),
      title: "Payments & Remittance",
      desc: (
        <>
          <strong className="font-bold text-brand-text">GCash</strong>, <strong className="font-bold text-brand-text">bill payments</strong>, and cash transactions <strong className="font-bold text-brand-text">available at the hub</strong>.
        </>
      ),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      ),
      title: "Other Community Services",
      desc: (
        <>
          <strong className="font-bold text-brand-text">Business permit assistance</strong>, <strong className="font-bold text-brand-text">insurance referrals</strong>, ID assistance and more.
        </>
      ),
    },
  ];

  return (
    <section id="services" className="bg-white py-16 lg:py-24 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl font-black tracking-wide mb-3 uppercase">
          OUR <span className="text-brand-red">SERVICES</span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-brand-text-secondary mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
          More than just a parcel hub — we provide convenient everyday services for the condo community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-7">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-white border-2 border-brand-border rounded-2xl p-7 sm:p-8 hover:shadow-xl hover:border-brand-red/40 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-between"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 bg-brand-red-bg rounded-2xl flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300 shadow-xs">
                {service.icon}
              </div>
              <div className="flex-1 flex flex-col justify-start">
                <h3 className="font-bold text-lg sm:text-xl text-brand-text mb-3 leading-snug">{service.title}</h3>
                <p className="text-sm sm:text-[15px] text-brand-text-secondary leading-relaxed">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4: How It Works                                            */
/* ------------------------------------------------------------------ */
function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      title: "SIGN UP",
      desc: "Create an account and choose a plan that suits your needs.",
      icon: (
        <svg className="w-10 h-10 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      num: 2,
      title: "WE RECEIVE",
      desc: "We accept your parcels from our partner couriers.",
      icon: (
        <svg className="w-10 h-10 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      num: 3,
      title: "GET NOTIFIED",
      desc: "We'll notify you once your parcel is ready for pickup.",
      icon: (
        <svg className="w-10 h-10 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          <path d="M4 4c-.7.7-1 1.8-1 3" />
          <path d="M20 4c.7.7 1 1.8 1 3" />
        </svg>
      ),
    },
    {
      num: 4,
      title: "PICK UP",
      desc: "Claim your parcel at the hub or enjoy door-to-door delivery (available for premium members).",
      icon: (
        <svg className="w-10 h-10 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v8M8 6h8" />
          <path d="M4 14l8-4 8 4-8 4-8-4z" />
          <path d="M4 14v4l8 4 8-4v-4" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-16 lg:py-20 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Left: Heading & CTA */}
          <div className="lg:w-1/4 text-center lg:text-left shrink-0">
            <h2 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl leading-[0.95] mb-3">
              HOW IT<br />
              <span className="text-brand-red">WORKS</span>
            </h2>
            <p className="text-brand-text-secondary text-sm sm:text-base mb-6 leading-relaxed">
              Get your parcels in 4 easy steps.
            </p>
            <Link
              href="/register"
              className="btn btn-primary btn-md px-6 shadow-sm inline-flex items-center gap-2"
            >
              GET STARTED →
            </Link>
          </div>

          {/* Right: 4 Steps Horizontal Chain */}
          <div className="lg:w-3/4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Connector Arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-14 -right-4 text-gray-300 text-2xl font-light z-10 select-none">
                    →
                  </div>
                )}

                {/* Number Badge */}
                <div className="w-7 h-7 rounded-full bg-brand-red text-white text-xs font-bold flex items-center justify-center mb-2 shadow-sm">
                  {step.num}
                </div>

                {/* Pale Pink Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-[#FFF0ED] flex items-center justify-center mb-4 transition-transform duration-200 hover:scale-105">
                  {step.icon}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider text-brand-text mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed max-w-[190px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  Section 5: Membership Plans                                        */
/* ------------------------------------------------------------------ */
function PricingSection() {
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

/* ------------------------------------------------------------------ */
/*  Section 6: Why Choose Us                                           */
/* ------------------------------------------------------------------ */
function WhyChooseUsSection() {
  const benefits = [
    { text: "Conveniently located inside your condominium", bold: "inside your condominium" },
    { text: "Trusted and secure parcel handling", bold: "secure parcel handling" },
    { text: "Affordable and flexible membership plans", bold: "Affordable and flexible" },
    { text: "Friendly and accommodating on-site staff", bold: "Friendly and accommodating" },
    { text: "More than parcels — we support your everyday community needs", bold: "everyday community needs" },
  ];

  return (
    <section id="about" className="bg-white py-16 lg:py-24 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left: Woman holding branded parcel box */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-lg max-w-[380px] w-full border border-gray-100">
              <Image
                src="/images/woman-branded-box.png"
                alt="Resident receiving parcel with CK Condo Drop Hub branded box"
                width={500}
                height={550}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Middle: Feature checklist */}
          <div className="lg:col-span-4">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-[44px] leading-[1.05] mb-6">
              WHY CHOOSE<br />
              <span className="text-brand-red">CK CONDO DROP HUB?</span>
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit.text} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center shrink-0 mt-0.5 text-white shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-base sm:text-[17px] font-semibold text-brand-text leading-snug">
                    {benefit.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Master handwritten script quote with red swoosh (Enlarged, Clean) */}
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="w-full max-w-[460px] sm:max-w-[490px] p-2">
              <Image
                src="/images/script-quote-trimmed.png"
                alt="“Making condo living easier, one parcel at a time.”"
                width={515}
                height={385}
                className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 7: Community Banner                                        */
/* ------------------------------------------------------------------ */
function CommunityBanner() {
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

/* ------------------------------------------------------------------ */
/*  Section 8: Announcements & FAQs                                    */
/* ------------------------------------------------------------------ */
const faqItems: FAQItem[] = [
  {
    question: "How do I sign up and start receiving parcels at the hub?",
    answer: (
      <p>
        Getting started is quick and easy! Click <strong className="font-bold text-brand-red">Sign Up</strong>, enter your name, mobile number, condominium tower, and unit number. Once registered, you will receive your unique resident drop code to use on your Shopee, Lazada, TikTok, and courier delivery addresses.
      </p>
    ),
  },
  {
    question: "How will I know when my parcel has arrived and is ready for pickup?",
    answer: (
      <p>
        The moment our front desk scans your parcel into the hub, you will receive an automatic <strong className="font-bold text-brand-text">SMS notification</strong> and an instant update in your resident customer portal with your package details and digital claim code.
      </p>
    ),
  },
  {
    question: "What are the hub operating hours for claiming packages?",
    answer: (
      <p>
        Our physical storefront is open <strong className="font-bold text-brand-text">Monday to Sunday from 8:00 AM to 9:00 PM</strong>, including weekends and selected public holidays. You can pick up anytime during these hours by presenting your claim QR code or 4-digit verification pin.
      </p>
    ),
  },
  {
    question: "How does the free holding period work?",
    answer: (
      <p>
        Every parcel receives <strong className="font-bold text-brand-text">3 days of free holding</strong> on the Regular and Per Parcel plans, and <strong className="font-bold text-brand-red">7 days of free holding</strong> on the Premium Plan. Parcels held past the free window incur a minimal holding fee of only ₱5 per day.
      </p>
    ),
  },
  {
    question: "How does the door-to-door concierge delivery service work?",
    answer: (
      <p>
        Premium members receive <strong className="font-bold text-brand-red">5 free door-to-door deliveries</strong> every month. You can request direct doorstep delivery to your unit with a single tap from your online customer portal during operating hours.
      </p>
    ),
  },
  {
    question: "Which courier services are accepted at CK Condo Drop Hub?",
    answer: (
      <p>
        We accept parcels from all major couriers including <strong className="font-bold text-brand-text">SPX Express</strong>, <strong className="font-bold text-brand-text">J&amp;T Express</strong>, <strong className="font-bold text-brand-text">Flash Express</strong>, LBC, Ninja Van, as well as on-demand riders like Grab and Lalamove.
      </p>
    ),
  },
];

function AnnouncementsSection() {
  const announcements = [
    {
      title: "Store Hours",
      desc: (
        <>
          <span className="font-extrabold text-brand-text block text-lg sm:text-xl mb-1.5">
            Monday – Sunday
          </span>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-red block my-2 tracking-tight">
            8:00 AM – 9:00 PM
          </span>
          <span className="text-base sm:text-lg text-brand-text font-bold block mt-2.5 leading-relaxed">
            Open daily including weekends and holidays for easy parcel pickup.
          </span>
        </>
      ),
    },
    {
      title: "Important Notice",
      desc: (
        <>
          <p className="text-lg sm:text-xl text-brand-text font-bold leading-relaxed">
            Please claim your parcels within the{" "}
            <span className="text-brand-red font-black underline decoration-2 underline-offset-4">
              3 to 7-day free holding period
            </span>{" "}
            to prevent extra storage charges.
          </p>
          <p className="text-base sm:text-lg text-brand-text font-semibold mt-3 leading-relaxed">
            Prompt pickup keeps our hub organized and prevents penalty fees.
          </p>
        </>
      ),
    },
    {
      title: "Promos & Updates",
      desc: (
        <>
          <p className="text-lg sm:text-xl text-brand-text font-bold leading-relaxed">
            Follow our{" "}
            <span className="text-brand-red font-black">
              official Facebook page
            </span>{" "}
            for the latest resident discounts, raffle promos, and community schedules.
          </p>
          <div className="mt-4">
            <Link
              href="https://facebook.com/ckcondrohub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-red font-black text-base sm:text-lg hover:underline"
            >
              <span>Visit facebook.com/ckcondrohub</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      ),
    },
  ];

  return (
    <section id="announcements" className="bg-white py-16 lg:py-24 scroll-mt-28 border-t border-brand-border/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-text-secondary">
              Community Board
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide mt-1 uppercase">
              ANNOUN<span className="text-brand-red">CEMENTS</span>
            </h2>
          </div>
          <Link
            href="https://facebook.com/ckcondrohub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red text-sm sm:text-base font-bold hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Follow our Facebook page</span>
            <span>→</span>
          </Link>
        </div>

        {/* Announcements Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {announcements.map((item) => (
            <div
              key={item.title}
              className="border-2 border-brand-border rounded-2xl p-8 sm:p-9 hover:shadow-xl hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-black text-2xl sm:text-3xl text-brand-text mb-4 uppercase tracking-wide">
                  {item.title}
                </h3>
                <div className="text-brand-text leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div id="faqs" className="mt-20 lg:mt-28 pt-16 lg:pt-20 border-t border-brand-border">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-text-secondary">
              Got Questions? We Have Answers
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-black mt-1.5 uppercase tracking-wide">
              FREQUENTLY ASKED <span className="text-brand-red">QUESTIONS</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-brand-text-secondary mt-3 max-w-2xl mx-auto font-medium leading-relaxed">
              Everything you need to know about receiving, claiming, and storing parcels at CK Condo Drop Hub.
            </p>
          </div>

          <FAQAccordion items={faqItems} className="max-w-4xl mx-auto" />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Assembly                                                      */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CourierStrip />
      <ServicesSection />
      <HowItWorksSection />
      <PricingSection />
      <WhyChooseUsSection />
      <CommunityBanner />
      <AnnouncementsSection />
    </>
  );
}
