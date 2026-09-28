"use client";

import FAQAccordion, { FAQItem } from "@/components/ui/FAQAccordion";
import { useParcels } from "@/context";
import { DEFAULT_HUB_SETTINGS } from "@/lib/db/seed-data";

export default function AnnouncementsSection() {
  const { hubSettings } = useParcels();

  const announcements =
    hubSettings.communityAnnouncements && hubSettings.communityAnnouncements.length > 0
      ? hubSettings.communityAnnouncements
      : DEFAULT_HUB_SETTINGS.communityAnnouncements || [];

  const rawFaqs =
    hubSettings.homeFaqs && hubSettings.homeFaqs.length > 0
      ? hubSettings.homeFaqs
      : DEFAULT_HUB_SETTINGS.homeFaqs || [];

  const faqItems: FAQItem[] = rawFaqs.map((f) => ({
    question: f.question,
    answer: <p className="leading-relaxed text-brand-text">{f.answer}</p>,
  }));

  return (
    <section id="announcements" className="bg-white py-16 lg:py-24 scroll-mt-28 border-t border-brand-border/60">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-brand-text-secondary">
            Community Board
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl font-black tracking-wide mt-1 uppercase">
            ANNOUN<span className="text-brand-red">CEMENTS</span>
          </h2>
        </div>

        {/* Announcements Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {announcements.map((item, idx) => (
            <div
              key={item.id || item.title || idx}
              className="border-2 border-brand-border rounded-2xl p-6 sm:p-8 lg:p-9 hover:shadow-xl hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-black text-2xl sm:text-3xl text-brand-text mb-3 uppercase tracking-wide">
                  {item.title}
                </h3>
                {item.highlight && (
                  <span className="text-xl sm:text-2xl font-black text-brand-red block mb-3 tracking-tight">
                    {item.highlight}
                  </span>
                )}
                <div className="text-brand-text leading-relaxed text-sm sm:text-base font-medium">
                  {item.desc}
                </div>
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
