import { Suspense } from "react";
import type { Metadata } from "next";

import { PortfolioShowcase } from "@/components/portfolio-showcase";
import { Badge } from "@/components/ui/badge";
import { getPortfolio } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Featured projects and case studies from our work.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio",
    description: "Featured projects and case studies from our work.",
    url: "/portfolio",
    siteName: siteConfig.name,
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Portfolio" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio",
    description: "Featured projects and case studies from our work.",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Portfolio" },
    ],
  },
};

async function PortfolioEntries() {
  const entries = await getPortfolio().catch(() => []);
  const published = entries.filter((e) => e.status === "published");
  if (published.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400">
        Portfolio coming soon.
      </p>
    );
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio",
    itemListElement: published.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: e.title,
        description: e.description ?? undefined,
        url: e.url ?? `${siteConfig.url}/portfolio`,
        image: e.coverImageUrl ?? undefined,
      },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioShowcase entries={published} />
    </>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="animate-pulse grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-72 rounded-[2rem] bg-slate-200 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Portfolio</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        Selected work, results-first
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        A look at some of the projects we have built, grown, and shipped for
        clients across industries.
      </p>
      <div className="mt-8">
        <Suspense fallback={<PortfolioSkeleton />}>
          <PortfolioEntries />
        </Suspense>
      </div>
    </div>
  );
}
