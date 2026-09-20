import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Section 1: Hero                                                    */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      {/* Red curved overlay (matching the client's distinctive red wave) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="absolute top-0 right-0 h-full w-[55%] hidden lg:block" viewBox="0 0 600 700" preserveAspectRatio="none">
          <path d="M100,0 L600,0 L600,700 L100,700 Q0,350 100,0 Z" fill="#CC0000" opacity="0.06" />
        </svg>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12 lg:py-16">
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

          {/* Right: Hub photo + benefit panel */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/hero-hub.jpg"
                alt="CK Condo Drop Hub interior — organized parcel receiving center"
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
/*  Section 2: Courier Partners                                        */
/* ------------------------------------------------------------------ */
function CourierStrip() {
  const couriers = [
    { name: "SPX Express", color: "#EE4D2D" },
    { name: "J&T Express", color: "#D21F1F" },
    { name: "Flash Express", color: "#FFD600" },
  ];

  return (
    <section className="bg-white border-y border-brand-border py-6">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <span className="text-xs uppercase tracking-[0.15em] text-brand-text-secondary font-semibold whitespace-nowrap">
            Our Partner Couriers
          </span>
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {couriers.map((courier) => (
              <div key={courier.name} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-[family-name:var(--font-heading)] text-white text-xs font-bold"
                  style={{ backgroundColor: courier.color }}
                >
                  {courier.name.substring(0, 3).toUpperCase()}
                </div>
                <span className="font-bold text-sm text-brand-text">{courier.name}</span>
              </div>
            ))}
            <span className="text-sm text-brand-text-muted italic">and more...</span>
          </div>
        </div>
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      ),
      title: "Parcel Receiving",
      desc: "We accept parcels from Shopee, J&T, Flash and other couriers.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      ),
      title: "Parcel Pick Up",
      desc: "Claim your parcels anytime within our operating hours.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      ),
      title: "Door-to-Door Delivery",
      desc: "Available for premium members.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      ),
      title: "Payments & Remittance",
      desc: "GCash, bill payments and other transactions (available at the hub).",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
      ),
      title: "Other Community Services",
      desc: "Business permit assistance, insurance referrals, ID assistance and more.",
    },
  ];

  return (
    <section id="services" className="bg-white py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl mb-2">
          OUR <span className="text-brand-red">SERVICES</span>
        </h2>
        <p className="text-brand-text-secondary mb-12 max-w-xl mx-auto">
          More than just a parcel hub — we provide convenient services for the condo community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-white border border-brand-border rounded-xl p-6 hover:shadow-lg hover:border-brand-red/30 transition-all duration-300 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-brand-red-bg rounded-full flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="font-bold text-sm mb-2">{service.title}</h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">{service.desc}</p>
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
    { num: 1, icon: "👤", title: "SIGN UP", desc: "Create an account and choose a plan that suits your needs." },
    { num: 2, icon: "📦", title: "WE RECEIVE", desc: "We accept your parcels from our partner couriers." },
    { num: 3, icon: "🔔", title: "GET NOTIFIED", desc: "We'll notify you once your parcel is ready for pickup." },
    { num: 4, icon: "✅", title: "PICK UP", desc: "Claim your parcel at the hub or enjoy door-to-door delivery (available for premium members)." },
  ];

  return (
    <section id="how-it-works" className="bg-brand-surface py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl mb-2">
              HOW IT <span className="text-brand-red">WORKS</span>
            </h2>
            <p className="text-brand-text-secondary">Get your parcels in 4 easy steps.</p>
          </div>
          <Link href="/register" className="btn btn-primary mt-4 sm:mt-0">
            GET STARTED →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-3 text-brand-text-muted text-xl">→</div>
              )}
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-white border-2 border-brand-border rounded-full flex items-center justify-center text-2xl shadow-sm">
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-red rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {step.num}
                </div>
              </div>
              <h3 className="font-bold text-sm mb-2">{step.title}</h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed max-w-[200px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5: Membership Plans                                        */
/* ------------------------------------------------------------------ */
function PricingSection() {
  const plans = [
    {
      name: "Per Parcel",
      price: "₱15",
      unit: "PER PARCEL",
      features: ["3 Days Free Holding"],
      cta: "SELECT PLAN",
      featured: false,
    },
    {
      name: "Regular Plan",
      price: "₱149",
      unit: "15 DAYS",
      features: ["Unlimited Parcels", "3 Days Free Holding"],
      cta: "SELECT PLAN",
      featured: false,
    },
    {
      name: "Premium Plan",
      price: "₱299",
      unit: "30 DAYS",
      features: ["Unlimited Parcels", "7 Days Holding Period", "5 Free Door-to-Door Delivery"],
      cta: "SELECT PLAN",
      featured: true,
    },
  ];

  return (
    <section id="pricing" className="relative overflow-hidden">
      {/* Red intro panel */}
      <div className="bg-brand-red text-white py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="lg:w-1/3">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">👑</span>
                <div>
                  <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl leading-none">
                    MEMBERSHIP<br />PLANS
                  </h2>
                </div>
              </div>
              <p className="text-white/90 mb-4">Choose the plan that fits your lifestyle.</p>
              <ul className="space-y-2 mb-6">
                {["More Convenience", "Priority Handling", "Affordable Rates", "Designed for Condo Residents"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/#pricing" className="btn bg-white text-brand-red hover:bg-gray-100 btn-sm">
                VIEW FULL PRICING →
              </Link>
            </div>

            {/* Cards */}
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl p-6 text-center relative ${
                    plan.featured
                      ? "bg-premium-cream border-2 border-premium-border text-brand-text"
                      : "bg-white text-brand-text"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 right-4 bg-brand-red text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                      Best Value!
                    </span>
                  )}
                  <div className="w-10 h-10 mx-auto mb-3 bg-brand-red-bg rounded-full flex items-center justify-center">
                    <span className="text-brand-red text-lg">📦</span>
                  </div>
                  <h3 className="font-bold text-sm mb-1">{plan.name}</h3>
                  <div className="font-[family-name:var(--font-heading)] text-4xl text-brand-red my-2">
                    {plan.price}
                  </div>
                  <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-4">{plan.unit}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-2.5 rounded-md text-sm font-semibold border-2 transition-colors ${
                    plan.featured
                      ? "bg-brand-red text-white border-brand-red hover:bg-brand-red-dark"
                      : "bg-white text-brand-text border-brand-text hover:bg-brand-text hover:text-white"
                  }`}>
                    {plan.cta}
                  </button>
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
/*  Section 6: Why Choose Us                                           */
/* ------------------------------------------------------------------ */
function WhyChooseUsSection() {
  const benefits = [
    "Conveniently located inside your condominium",
    "Trusted and secure parcel handling",
    "Affordable and flexible plans",
    "Friendly and accommodating staff",
    "More than parcels — we support your everyday needs",
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Photo */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/images/woman-parcel.jpg"
              alt="Happy resident receiving her parcel"
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Content */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl mb-6">
              WHY CHOOSE<br />
              <span className="text-brand-red">CK CONDO DROP HUB?</span>
            </h2>
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-brand-red rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span className="text-brand-text-secondary">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="bg-brand-surface rounded-xl p-6 border border-brand-border">
              <p className="font-[family-name:var(--font-heading)] text-2xl text-brand-text italic leading-snug">
                &ldquo;Making condo living easier,<br />one parcel at a time.&rdquo;
              </p>
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
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-brand-dark/60" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl leading-[1.05] mb-4">
            A MORE CONVENIENT<br />
            CONDO COMMUNITY TOGETHER.
          </h2>
          <p className="text-white/80 mb-8 max-w-lg">
            Reliable parcel handling and essential services, right at your doorstep.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            JOIN NOW →
          </Link>
        </div>

        {/* Value icons */}
        <div className="flex flex-wrap gap-10 mt-12">
          {[
            { icon: "👥", label: "For Residents" },
            { icon: "🛡️", label: "For a Safer Community" },
            { icon: "❤️", label: "For a Better Living" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{item.icon}</span>
              <span className="text-sm text-white/90">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 8: Announcements                                           */
/* ------------------------------------------------------------------ */
function AnnouncementsSection() {
  const announcements = [
    {
      icon: "🕐",
      title: "Store Hours",
      desc: "Mon – Sun\n8:00 AM – 9:00 PM",
      color: "text-brand-red",
    },
    {
      icon: "⚠️",
      title: "Important Notice",
      desc: "Please claim your parcels within the holding period to avoid additional fees.",
      color: "text-brand-red",
    },
    {
      icon: "📣",
      title: "Promos & Updates",
      desc: "Follow our Facebook page for the latest promos and announcements.",
      color: "text-brand-red",
    },
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">
            ANNOUN<span className="text-brand-red">CEMENTS</span>
          </h2>
          <Link href="#" className="text-brand-red text-sm font-semibold hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((item) => (
            <div
              key={item.title}
              className="border border-brand-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-red-bg rounded-full flex items-center justify-center shrink-0 text-xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-sm text-brand-text-secondary whitespace-pre-line leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
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
