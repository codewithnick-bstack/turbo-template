"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENTS, trackClarityEvent, trackEvent } from "@/lib/analytics";

type Props = {
  label: string;
  variant?: "default" | "secondary";
  size?: "default" | "lg";
  serviceTitle?: string;
};

export function PricingCta({ label, variant = "secondary", size = "default", serviceTitle }: Props) {
  return (
    <Link
      href="/contact"
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.PRICING_CTA_CLICKED, {
          label,
          ...(serviceTitle ? { service: serviceTitle } : {}),
        });
        trackClarityEvent(ANALYTICS_EVENTS.PRICING_CTA_CLICKED);
      }}
    >
      <Button className="w-full" variant={variant} size={size}>
        {label}
      </Button>
    </Link>
  );
}
