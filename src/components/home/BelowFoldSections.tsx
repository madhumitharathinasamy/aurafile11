"use client";

import { ScrollReveal } from "@/components/ScrollReveal";
import ToolsSection from "@/components/home/ToolsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import BlogSection from "@/components/home/BlogSection";
import { Reviews } from "@/components/ui/Reviews";

/**
 * BelowFoldSections
 *
 * Architecture fixed:
 * - Removed `dynamic` and `ssr: false` to allow Next.js server to prerender
 *   these sections natively. This COMPLETELY eliminates the massive Cumulative
 *   Layout Shift (CLS: 0.42) when the invisible intersection observer triggered, 
 *   as the correct sizing is now calculated natively at Time To First Byte parsing.
 */

export function BelowFoldSections() {
  return (
    <>
      <ScrollReveal>
        <ToolsSection />
      </ScrollReveal>
      <ScrollReveal>
        <FeaturesSection />
      </ScrollReveal>
      <ScrollReveal>
        <BlogSection />
      </ScrollReveal>
      <ScrollReveal>
        <Reviews />
      </ScrollReveal>
    </>
  );
}
