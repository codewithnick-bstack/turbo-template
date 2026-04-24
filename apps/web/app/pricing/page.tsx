import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { services, faqs } from "@/lib/site-data";
import { siteConfig } from "@/lib/site-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing for website design, development, and growth services.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing",
    description: "Transparent pricing for website design, development, and growth services.",
    url: "/pricing",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Pricing" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description: "Transparent pricing for website design, development, and growth services.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Pricing" }],
  },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@graph": services.map((service) => ({
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    offers: {
      "@type": "Offer",
      price: service.priceFrom,
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: service.priceFrom,
        priceCurrency: "USD",
        description: "starting from",
      },
      url: `${siteConfig.url}/contact`,
    },
  })),
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <div className="text-center">
        <Badge>Pricing</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Simple, honest pricing</h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          Fixed-scope packages with clear deliverables. No hourly surprises.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Card key={service.slug} className={i === 1 ? "ring-2 ring-indigo-500" : ""}>
            {i === 1 ? (
              <div className="-mt-2 mb-3">
                <Badge className="bg-indigo-600 text-white">Most popular</Badge>
              </div>
            ) : null}
            <h2 className="text-xl font-semibold">{service.title}</h2>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(service.priceFrom)}
              <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">starting from</span>
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {service.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <span className="text-indigo-500">✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href="/contact">
                <Button className="w-full" variant={i === 1 ? "default" : "secondary"}>
                  Get started
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Common questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-12 text-center">
        <p className="text-slate-600 dark:text-slate-300">Not sure which package fits? Let&apos;s talk.</p>
        <div className="mt-4">
          <Link href="/contact">
            <Button size="lg">Book a free consultation</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
