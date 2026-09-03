import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { TextLink } from "@/components/cta";
import { industries, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Construction and infrastructure executive search, from field leadership through the C-suite.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services",
    description:
      "Construction and infrastructure executive search, from field leadership through the C-suite.",
    url: "/services",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services",
    description:
      "Construction and infrastructure executive search, from field leadership through the C-suite.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

export default function ServicesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Construction and infrastructure executive search",
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "US",
    serviceType: industries.map((industry) => industry.title),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow="Services"
        title="One service: finding the right person for the role."
        intro="Field and office leadership through the C-suite, across the industries we know best."
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="What we cover" title="Industries served" size="lg" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {industries.map((industry, index) => (
              <Reveal key={industry.slug} index={index}>
                <div className="h-full border border-[var(--border)] bg-[var(--card)] p-8">
                  <h3 className="font-display text-xl font-semibold text-[var(--navy)] dark:text-white">
                    {industry.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{industry.description}</p>
                  <TextLink href="/contact" label="Ask about openings" className="mt-6" />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
