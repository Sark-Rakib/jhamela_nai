import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import {
  CategoryGrid,
  FaqSection,
  FeatureBand,
  FeaturedTools,
  FinalCta,
  HowItWorks,
} from "@/components/home/sections";
import { AiAssistant } from "@/features/ai-assistant/ai-assistant";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.nameBn} — ${SITE.tagline}`,
  description: SITE.shortDescription,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="container-page">
        <AiAssistant className="py-16" />
      </div>
      <CategoryGrid />
      <FeaturedTools />
      <HowItWorks />
      <FeatureBand />
      <FaqSection />
      <FinalCta />
    </>
  );
}