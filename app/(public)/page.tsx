import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { BusinessTypes } from "@/components/landing/business-types";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesDeepDive } from "@/components/landing/features-deep-dive";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <BusinessTypes />
        <HowItWorks />
        <FeaturesDeepDive />
        <DashboardPreview />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
