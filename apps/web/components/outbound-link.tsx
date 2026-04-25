"use client";

import { ANALYTICS_EVENTS, trackClarityEvent, trackEvent } from "@/lib/analytics";

interface OutboundLinkProps {
  href: string;
  source: string;
  className?: string;
  children: React.ReactNode;
}

export function OutboundLink({ href, source, className, children }: OutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.OUTBOUND_LINK_CLICKED, { url: href, source });
        trackClarityEvent(ANALYTICS_EVENTS.OUTBOUND_LINK_CLICKED);
      }}
    >
      {children}
    </a>
  );
}
