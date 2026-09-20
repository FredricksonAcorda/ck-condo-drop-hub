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
        <div className="flex items-center bg-[#FFE500] px-4 py-1.5 rounded-lg border border-[#F2C000]">
          <span className="text-3xl sm:text-4xl font-black italic text-black tracking-tight select-none">
            Flash
          </span>
          <span className="text-xs font-black uppercase text-black ml-1 border-l-2 border-black pl-1.5 leading-none select-none">
            Express
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
    <section className="bg-brand-surface py-7 sm:py-9 border-y border-brand-border/70 overflow-hidden select-none">
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
