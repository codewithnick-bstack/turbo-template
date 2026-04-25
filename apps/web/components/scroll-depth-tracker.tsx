"use client";

import { useEffect } from "react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

const CHECKPOINTS = [50, 90];

export function ScrollDepthTracker({ page }: { page: string }) {
  useEffect(() => {
    const fired = new Set<number>();

    const handler = () => {
      const pct =
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
      for (const cp of CHECKPOINTS) {
        if (pct >= cp && !fired.has(cp)) {
          fired.add(cp);
          trackEvent(ANALYTICS_EVENTS.SCROLL_DEPTH, { percent: cp, page });
        }
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [page]);

  return null;
}
