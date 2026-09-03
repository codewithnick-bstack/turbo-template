import type { Metadata } from "next";

import { CtaLink } from "@/components/cta";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { faqs, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Pricing",
  description: "How S.R. Clarke is paid — candidates never pay a fee.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing",
    description: "How S.R. Clarke is paid — candidates never pay a fee.",
    url: "/pricing",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing",
    description: "How S.R. Clarke is paid — candidates never pay a fee.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

// Recruiting fees are negotiated per search and paid by the hiring company —
// there is no packaged/tiered pricing to display, so this page states the
// one fact that is public (candidates never pay) and routes both audiences
// to a real conversation instead of a fabricated price table.
const feeFaq = faqs.find((faq) => faq.question === "Do you charge candidates?");

export default function PricingPage() {
  return (
    <div>
      <PageHero
        eyebrow="Pricing"
        title="Candidates never pay a fee."
        intro={
          feeFaq?.answer ??
          "Our fees are paid by the hiring company. Working with us costs a candidate nothing."
        }
      />

      <Section>
        <Container measure="narrow">
          <Reveal>
            <p className="text-lg leading-8 text-[var(--muted)]">
              Employer search fees are scoped and negotiated per engagement — they depend on the
              role, the level, and how the search is run. There is no packaged rate card to quote
              in the abstract. The fastest way to get a number is to tell us what you are trying to
              fill.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="/employers" label="Start a search" variant="outlineDark" size="lg" withArrow />
              <CtaLink href="/contact" label="Talk to us" variant="outlineDark" size="lg" />
            </div>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
