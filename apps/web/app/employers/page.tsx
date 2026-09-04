import type { Metadata } from "next";

import { CountUp } from "@/components/count-up";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { audiencePaths, industries, stats } from "@/lib/site-data";

const path = audiencePaths.employer;

export const metadata: Metadata = {
  title: "For Employers",
  description:
    "Construction executive search and field leadership recruiting from a 275,374-strong candidate database. Vetted, verified, guaranteed.",
};

export default function EmployersPage() {
  return (
    <div>
      <PageHero
        image={photos.employerOffice}
        eyebrow={path.audience}
        title={path.title}
        intro={path.description}
        cta={{ label: "Start a search", href: "/contact" }}
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
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading eyebrow="Coverage" title="Where we place people." size="lg" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {industries.map((industry, index) => (
              <Reveal key={industry.slug} index={index}>
                <div className="h-full border border-[var(--border)] bg-[var(--card)] p-8">
                  <h3 className="font-display text-xl font-semibold text-[var(--navy)] dark:text-white">
                    {industry.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {industry.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
