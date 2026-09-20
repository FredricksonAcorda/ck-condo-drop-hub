import {
  HeroSection,
  CourierStrip,
  ServicesSection,
  HowItWorksSection,
  PricingSection,
  WhyChooseUsSection,
  CommunityBanner,
  AnnouncementsSection,
} from "@/components/sections";

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
