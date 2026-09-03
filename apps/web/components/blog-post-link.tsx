"use client";

import Link from "next/link";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

interface BlogPostLinkProps {
  href: string;
  slug: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function BlogPostLink({ href, slug, title, className, children }: BlogPostLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(ANALYTICS_EVENTS.BLOG_POST_CLICKED, { slug, title })}
    >
      {children}
    </Link>
  );
}
