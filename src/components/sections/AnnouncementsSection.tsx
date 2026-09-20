import Link from "next/link";
import FAQAccordion, { FAQItem } from "@/components/ui/FAQAccordion";

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

export default function AnnouncementsSection() {
  const announcements = [
    {
      title: "Store Hours",
      desc: (
        <>
          <span className="font-extrabold text-brand-text block text-base sm:text-lg lg:text-xl mb-1.5">
            Monday – Sunday
          </span>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-red block my-2 tracking-tight">
            8:00 AM – 9:00 PM
          </span>
          <span className="text-sm sm:text-base lg:text-lg text-brand-text font-bold block mt-2.5 leading-relaxed">
            Open daily including weekends and holidays for easy parcel pickup.
          </span>
        </>
      ),
    },
    {
      title: "Important Notice",
      desc: (
        <>
          <p className="text-base sm:text-lg lg:text-xl text-brand-text font-bold leading-relaxed">
            Please claim your parcels within the{" "}
            <span className="text-brand-red font-black underline decoration-2 underline-offset-4">
              3 to 7-day free holding period
            </span>{" "}
            to prevent extra storage charges.
          </p>
          <p className="text-sm sm:text-base lg:text-lg text-brand-text font-semibold mt-3 leading-relaxed">
            Prompt pickup keeps our hub organized and prevents penalty fees.
          </p>
        </>
      ),
    },
    {
      title: "Promos & Updates",
      desc: (
        <p className="text-base sm:text-lg lg:text-xl text-brand-text font-bold leading-relaxed">
          Follow our{" "}
          <Link
            href="https://facebook.com/ckcondrohub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red font-black hover:underline"
          >
            official Facebook page
          </Link>{" "}
          for the latest resident discounts, raffle promos, and community schedules.
        </p>
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
              className="border-2 border-brand-border rounded-2xl p-6 sm:p-8 lg:p-9 hover:shadow-xl hover:border-brand-red/50 hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col justify-between"
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
