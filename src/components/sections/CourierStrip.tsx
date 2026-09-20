import LogoLoop, { LogoItem } from "@/components/ui/LogoLoop";

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
        <div className="flex items-center text-3xl sm:text-4xl font-black italic text-black select-none tracking-tight">
          <span>FL</span>
          <span className="inline-flex items-center justify-center -mx-0.5 text-[#FFD600] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            <svg className="w-8 h-8 fill-[#FFD600] stroke-black stroke-[1.5] -rotate-6" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
          <span>SH</span>
          <span className="text-xl sm:text-2xl font-black italic tracking-normal text-[#E31837] ml-1.5">
            EXPRESS
          </span>
        </div>
      </div>
    ),
    title: "Flash Express",
    ariaLabel: "Flash Express Courier Partner"
  },
  {
    node: (
      <div className="flex items-center justify-center px-7 sm:px-9 py-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:border-brand-red/30 transition-all cursor-pointer">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-widest text-[#E31837] border-2 border-[#E31837] px-2 py-0.5 rounded select-none">
            LBC
          </span>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight select-none">
            Express
          </span>
        </div>
      </div>
    ),
    title: "LBC Express",
    ariaLabel: "LBC Express Partner"
  },
  {
    node: (
      <div className="flex items-center justify-center px-7 sm:px-9 py-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs hover:shadow-md hover:border-brand-red/30 transition-all cursor-pointer">
        <div className="flex items-center gap-1">
          <span className="text-2xl sm:text-3xl font-black text-[#C10015] tracking-tighter select-none">
            NINJA
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-black select-none">
            VAN
          </span>
        </div>
      </div>
    ),
    title: "Ninja Van",
    ariaLabel: "Ninja Van Partner"
  },
];

export default function CourierStrip() {
  return (
    <section className="bg-brand-surface py-10 sm:py-12 border-y border-brand-border/70 overflow-hidden select-none w-full">
      {/* Centered Heading and Description */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-text-secondary mb-1.5">
          Fast &amp; Reliable Delivery Network
        </p>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-brand-text uppercase">
          OUR PARTNER <span className="text-brand-red">COURIERS</span>
        </h2>
        <p className="text-xs sm:text-sm text-brand-text-secondary mt-2 max-w-xl mx-auto font-medium leading-relaxed">
          Official parcel drop-off and pickup point for Shopee, Lazada, TikTok Shop, and all major courier services in the Philippines.
        </p>
      </div>

      {/* Full-width continuous logo loop */}
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
