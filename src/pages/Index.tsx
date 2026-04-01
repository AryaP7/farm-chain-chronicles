import HeroSection from "@/components/HeroSection";
import JourneySection from "@/components/JourneySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FreshnessSection from "@/components/FreshnessSection";
import FundFarmersSection from "@/components/FundFarmersSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="bg-background">
      <HeroSection />
      <JourneySection />
      <HowItWorksSection />
      <FreshnessSection />
      <FundFarmersSection />
      <CTASection />
    </main>
  );
};

export default Index;
