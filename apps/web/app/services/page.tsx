import type { Metadata } from "next";

import { ServicesShowcase } from "@/components/services-showcase";
import { Badge } from "@/components/ui/badge";
import { services, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore the service packages included in the starter demo site.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services",
    description: "Explore the service packages included in the starter demo site.",
    url: "/services",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Services" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services",
    description: "Explore the service packages included in the starter demo site.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Services" }],
  },
};

export default function ServicesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.summary,
        provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
      },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Badge>Services</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Service packages that turn visits into conversations</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Each card can be repurposed for design, consulting, legal, wellness, real estate, or portfolio websites. Use the demo copy as a starting point and adapt it per client.
      </p>
      <div className="mt-8">
        <ServicesShowcase />
      </div>
    </div>
  );
}
