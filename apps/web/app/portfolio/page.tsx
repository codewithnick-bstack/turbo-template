import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { PortfolioShowcase } from "@/components/portfolio-showcase";
import { getPortfolio } from "@/lib/api";
import { photos } from "@/lib/photos";
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
    <div>
      <PageHero
        eyebrow="Case studies"
        title="Searches we have closed."
        intro="The role, the timeline, and what the hire changed on site. Told plainly."
        image={photos.development}
      />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Suspense fallback={<PortfolioSkeleton />}>
          <PortfolioEntries />
        </Suspense>
      </div>
    </div>
  );
}
