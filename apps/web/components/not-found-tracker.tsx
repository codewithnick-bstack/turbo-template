"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function NotFoundTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.PAGE_NOT_FOUND, { path: pathname ?? "/" });
  }, [pathname]);
  return null;
}
