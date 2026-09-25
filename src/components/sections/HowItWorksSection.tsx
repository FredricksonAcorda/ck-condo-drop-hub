import Link from "next/link";

interface StepItem {
  num: number;
  title: string;
  desc: string;
}

const steps: StepItem[] = [
  {
    num: 1,
    title: "SIGN UP",
    desc: "Create an account and choose a plan that suits your needs.",
  },
  {
    num: 2,
    title: "WE RECEIVE",
    desc: "We accept your parcels from our partner couriers.",
  },
  {
    num: 3,
    title: "GET NOTIFIED",
    desc: "We'll notify you once your parcel is ready for pickup.",
  },
  {
    num: 4,
    title: "PICK UP",
    desc: "Claim your parcel at the Lobby or enjoy door-to-door delivery (available for premium members).",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-16 lg:py-24 scroll-mt-28">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Left: Heading & CTA */}
          <div className="lg:w-1/4 text-center lg:text-left shrink-0">
            <h2 className="font-[family-name:var(--font-heading)] text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-4 font-black">
              HOW IT<br />
              <span className="text-brand-red">WORKS</span>
            </h2>
            <p className="text-brand-text-secondary text-base sm:text-lg mb-6 leading-relaxed font-medium">
              Get your parcels in 4 easy steps.
            </p>
            <Link
              href="/register"
              className="btn btn-primary btn-lg px-7 shadow-md inline-flex items-center gap-2 font-bold"
            >
              GET STARTED →
            </Link>
          </div>

          {/* Right: 4 Steps Horizontal Chain */}
          <div className="lg:w-3/4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center group">
                {/* Connector Arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 sm:top-10 -right-4 text-gray-300 text-2xl font-light z-10 select-none">
                    →
                  </div>
                )}

                {/* Big Number Circle */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-red text-white flex items-center justify-center mb-5 font-black text-3xl sm:text-4xl shadow-md shadow-brand-red/20 ring-4 ring-brand-red/10 transition-transform duration-200 group-hover:scale-105 select-none">
                  {step.num}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-lg sm:text-xl uppercase tracking-wider text-brand-text mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-[15px] text-brand-text-secondary leading-relaxed max-w-[220px]">
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
