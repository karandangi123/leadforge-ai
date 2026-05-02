import { HeroRevenueFlow } from "@/components/marketing/sections/HeroRevenueFlow";
import { RevenueEngineDiagram } from "@/components/marketing/sections/RevenueEngineDiagram";
import { ScrollProductStory } from "@/components/marketing/sections/ScrollProductStory";
import { FeatureBentoGrid } from "@/components/marketing/sections/FeatureBentoGrid";
import { AudienceAndTrust } from "@/components/marketing/sections/AudienceAndTrust";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

export default function MarketingPage() {
  return (
    <>
      <HeroRevenueFlow />
      <RevenueEngineDiagram />
      <ScrollProductStory />
      <FeatureBentoGrid />
      <AudienceAndTrust />
      <FinalCTA />
    </>
  );
}
