"use client";

/**
 * BelowFoldSections
 *
 * Architecture:
 * - "use client" → allows ssr: false, cutting these from the SSR bundle entirely
 * - All 4 sections (Tools, Features, Blog, Reviews) are dynamically imported with ssr:false
 * - They load only after ONE of two triggers (whichever fires first):
 *     1. requestIdleCallback fires (browser is idle after hero paint)
 *     2. User scrolls past the hero (IntersectionObserver on sentinel div)
 * - This guarantees the Hero paints at the fastest possible FCP, then sections
 *   load progressively without blocking the main thread.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

// ── Dynamic imports with ssr: false ─────────────────────────────────────────
// These are excluded from the SSR HTML entirely. The Hero renders server-side;
// these components download only AFTER the page is interactive.

const ToolsSection = dynamic(
  () => import("@/components/home/ToolsSection"),
  { ssr: false }
);

const FeaturesSection = dynamic(
  () => import("@/components/home/FeaturesSection"),
  { ssr: false }
);

const BlogSection = dynamic(
  () => import("@/components/home/BlogSection"),
  { ssr: false }
);

const Reviews = dynamic(
  () => import("@/components/ui/Reviews").then(m => m.Reviews),
  { ssr: false }
);

// ── Component ────────────────────────────────────────────────────────────────

export function BelowFoldSections() {
  const [shouldRender, setShouldRender] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Already triggered (e.g., fast return navigation)
    if (shouldRender) return;

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShouldRender(true);
    };

    // Strategy 1: Load when browser is idle (best for slow networks/devices)
    // Falls back to setTimeout on browsers without requestIdleCallback
    let idleHandle: ReturnType<typeof setTimeout>;
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(() => trigger(), { timeout: 2000 });
      idleHandle = id as unknown as ReturnType<typeof setTimeout>;
    } else {
      idleHandle = setTimeout(trigger, 300);
    }

    // Strategy 2: Load immediately when user scrolls down (IntersectionObserver)
    // Whichever fires first wins — this handles fast scrollers.
    let observer: IntersectionObserver | null = null;
    if (sentinelRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            trigger();
            observer?.disconnect();
          }
        },
        { rootMargin: "200px" } // Start loading 200px before the section enters viewport
      );
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (typeof cancelIdleCallback !== "undefined" && typeof idleHandle === "number") {
        cancelIdleCallback(idleHandle as unknown as number);
      } else {
        clearTimeout(idleHandle);
      }
      observer?.disconnect();
    };
  }, [shouldRender]);

  return (
    <>
      {/* Sentinel: invisible div right below hero that triggers the observer */}
      <div ref={sentinelRef} aria-hidden="true" />

      {shouldRender ? (
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
      ) : (
        // Placeholder to maintain layout height and avoid CLS
        // Height approximates the stacked sections so scroll position is stable
        <div aria-hidden="true" style={{ minHeight: "200px" }} />
      )}
    </>
  );
}
