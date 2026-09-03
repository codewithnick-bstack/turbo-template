import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { TextLink } from "@/components/cta";
import { industries } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Positions & Opportunities",
  description:
    "Open construction and infrastructure roles across commercial, heavy civil, development, and sub-contracting.",
};

export default function PositionsPage() {
  return (
    <div>
      <PageHero
        eyebrow="Positions & Opportunities"
        title="Open roles across the industries we serve."
        intro="Many of our searches are confidential and never posted. Tell us what you are looking for and we will match you against the full board."
        cta={{ label: "Send your resume", href: "/contact" }}
      />

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {industries.map((industry, index) => (
              <Reveal key={industry.slug} index={index}>
                <div
                  id={industry.slug}
                  className="flex h-full scroll-mt-[var(--header-height)] flex-col justify-between border border-[var(--border)] bg-[var(--card)] p-8"
                >
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[var(--navy)] dark:text-white">
                      {industry.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{industry.description}</p>
                  </div>
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
