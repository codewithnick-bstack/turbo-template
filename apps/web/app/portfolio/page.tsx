import type { Metadata } from "next";

import { CtaPair } from "@/components/cta";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { Section, Container } from "@/components/section";
import { sampleCaseStudies } from "@/lib/sample-content";
import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Executive searches S.R. Clarke has closed across commercial construction, heavy civil, and real estate development — roles, scope, and outcomes.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio",
    description: "Executive searches S.R. Clarke has closed across commercial construction, heavy civil, and real estate development — roles, scope, and outcomes.",
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
    description: "Executive searches S.R. Clarke has closed across commercial construction, heavy civil, and real estate development — roles, scope, and outcomes.",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Portfolio" },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Portfolio",
  itemListElement: sampleCaseStudies.map((entry, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "CreativeWork",
      name: entry.roleTitle,
      description: entry.challenge,
    },
  })),
};

export default function PortfolioPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        eyebrow="Case studies"
        title="Searches we have closed."
        intro="The role, the timeline, and what the hire changed on site. Told plainly."
        image={photos.development}
      />

      <Section>
        <Container>
          {sampleCaseStudies.map((entry, index) => {
            const reversed = index % 2 === 1;
            return (
              <Reveal key={entry.id} index={index}>
                <article
                  className={cn(
                    "grid gap-8 py-12 lg:grid-cols-2 lg:gap-16",
                    index > 0 && "border-t border-[var(--border)]",
                  )}
                >
                  <div className={cn(reversed && "lg:order-2")}>
                    <Rule />
                    <p className="eyebrow mt-6">{entry.sector}</p>
                    <h2 className="font-display mt-4 text-2xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-3xl dark:text-white">
                      {entry.roleTitle}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                      {entry.location}
                    </p>
                    <p className="eyebrow mt-8">What made it hard</p>
                    <p className="mt-3 max-w-md text-base leading-7 text-[var(--muted)]">
                      {entry.challenge}
                    </p>
                  </div>
                  <div className={cn(reversed && "lg:order-1")}>
                    <p className="eyebrow">How it closed</p>
                    <ul className="mt-4 space-y-0">
                      {entry.approach.map((bullet) => (
                        <li
                          key={bullet}
                          className="border-t border-[var(--border)] py-4 text-sm leading-6 text-[var(--muted)] first:border-t-0"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </Container>
      </Section>

      <Section tone="muted" bordered>
        <Container measure="narrow" className="text-center">
          <Reveal>
            <Rule className="mx-auto" />
            <h2 className="font-display mt-6 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
              One conversation tells you whether we can help.
            </h2>
            <CtaPair size="lg" align="center" onDark={false} className="mt-10" />
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
