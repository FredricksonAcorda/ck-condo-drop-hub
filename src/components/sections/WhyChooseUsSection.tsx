import Image from "next/image";

interface BenefitItem {
  text: string;
  bold: string;
}

const benefits: BenefitItem[] = [
  { text: "Conveniently located inside your condominium", bold: "inside your condominium" },
  { text: "Trusted and secure parcel handling", bold: "secure parcel handling" },
  { text: "Affordable and flexible membership plans", bold: "Affordable and flexible" },
  { text: "Friendly and accommodating on-site staff", bold: "Friendly and accommodating" },
  { text: "More than parcels — we support your everyday community needs", bold: "everyday community needs" },
];

export default function WhyChooseUsSection() {
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

          {/* Right: Master handwritten script quote with red swoosh */}
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
