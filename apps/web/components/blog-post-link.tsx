"use client";

import Link from "next/link";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface BlogPostLinkProps {
  href: string;
  slug: string;
  title: string;
  children: React.ReactNode;
}

export function BlogPostLink({ href, slug, title, children }: BlogPostLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent(ANALYTICS_EVENTS.BLOG_POST_CLICKED, { slug, title })}
    >
      {children}
    </Link>
  );
}
