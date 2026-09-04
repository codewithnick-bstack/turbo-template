import type { Metadata } from "next";

import { CountUp } from "@/components/count-up";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { BridgeSectionMark } from "@/components/bridge-section-mark";
import { SectionHeading } from "@/components/section-heading";
import { stats, values } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Why SRC",
  description:
    "41 years and approximately 35,000 placements across commercial construction, heavy civil, development, and sub-contracting.",
};

export default function WhySrcPage() {
  return (
    <div>
      <PageHero
        image={photos.skylineBand}
        eyebrow="Why SRC"
        title="Four decades of putting the right people on site."
        intro="S.R. Clarke Consulting Services has provided the professionals who built and renovated America's most iconic buildings, bridges, highways, and surrounding infrastructure."
        cta={{ label: "Talk to a recruiter", href: "/contact" }}
      />

      <Section space="tight" tone="muted" bordered>
        <Container measure="full">
          <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} index={index}>
                <dd className="font-display tnum text-3xl font-semibold text-[var(--navy)] dark:text-white">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-1 text-xs tracking-wide text-[var(--muted)] uppercase">
                  {stat.label}
                </dt>
              </Reveal>
            ))}
          </dl>
          {/* The numbers describe infrastructure, so they stand on a
              drawing of it. Full width and hard against the section
              floor: centred and boxed, it read as a small object
              stranded in an empty band. */}
          <BridgeSectionMark className="mt-10 h-16 w-full stroke-[var(--navy)]/25 sm:h-20 dark:stroke-white/20" />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="What we hold ourselves to."
            size="lg"
          />
          <dl className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {values.map((value, index) => (
              <Reveal
                key={value.title}
                index={index}
                className="border-t border-[var(--border)] pt-5"
              >
                <dt className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {value.title}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {value.description}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>
    </div>
  );
}
