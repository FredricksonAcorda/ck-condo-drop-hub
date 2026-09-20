import React from "react";

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}

const services: ServiceItem[] = [
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

export default function ServicesSection() {
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
