import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import JourneySection from "@/components/JourneySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FreshnessSection from "@/components/FreshnessSection";
import FundFarmersSection from "@/components/FundFarmersSection";
import CTASection from "@/components/CTASection";
import { TraceabilityDemo } from "@/components/TraceabilityDemo";

const Index = () => {
  return (
    <main className="bg-background">
      <Navbar />
      <HeroSection />
      
      {/* LOCAL EVM PROTOTYPE DEMO */}
      <div className="max-w-4xl mx-auto w-full px-6">
        <TraceabilityDemo />
      </div>

      <JourneySection />
      <HowItWorksSection />
      <FreshnessSection />
      <FundFarmersSection />
      <CTASection />
    </main>
  );
};

export default Index;
