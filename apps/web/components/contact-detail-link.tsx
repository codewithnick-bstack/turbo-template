"use client";

import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface ContactDetailLinkProps {
  href: string;
  type: "email" | "phone";
  children: React.ReactNode;
  className?: string;
}

export function ContactDetailLink({ href, type, children, className }: ContactDetailLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent(ANALYTICS_EVENTS.CONTACT_DETAIL_CLICKED, { type })}
    >
      {children}
    </a>
  );
}
