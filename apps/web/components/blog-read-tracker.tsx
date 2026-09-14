"use client";

import { useEffect } from "react";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function BlogReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    let fired = false;

    const fire = () => {
      if (fired) return;
      fired = true;
      trackEvent(ANALYTICS_EVENTS.BLOG_POST_READ, { slug });
    };

    const timer = setTimeout(fire, 60_000);

    const scrollHandler = () => {
      const pct =
        ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100;
      if (pct >= 80) fire();
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [slug]);

  return null;
}
