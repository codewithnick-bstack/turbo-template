import { Suspense } from "react";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { ParallaxBand } from "@/components/parallax-band";
import { Rule } from "@/components/rule";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { getTeam } from "@/lib/api";
import { values, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description:
    "S.R. Clarke Consulting Services — 41 years of construction and infrastructure executive recruiting.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About",
    description:
      "41 years of construction and infrastructure executive recruiting.",
    url: "/about",
    siteName: siteConfig.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description:
      "41 years of construction and infrastructure executive recruiting.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
};

async function TeamSection() {
  const team = await getTeam().catch(() => []);
  if (team.length === 0) return null;
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading eyebrow="Who we are" title="Meet the team" size="lg" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {team.map((member, index) => (
            <Reveal key={member.id} index={index}>
              <div className="border-t-2 border-[var(--accent)] bg-[var(--card)] p-6">
                <h3 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-[var(--accent-text)]">
                  {member.title}
                </p>
                {member.bio ? (
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {member.bio}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default function AboutPage() {
  return (
    <div>
      <PageHero
        image={photos.craneDusk}
        eyebrow="About"
        title="Four decades on the same desk."
        intro="S.R. Clarke Consulting Services has provided the professionals who built and renovated America's most iconic buildings, bridges, highways, and surrounding infrastructure — for 41 years and roughly 35,000 placements."
      />

      {/* A photograph between the people and the principles, so the page is
          not two stacks of type. The line is the page's own headline. */}
      <ParallaxBand image={photos.heavyCivil.src} className="py-24 text-white lg:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Rule light className="mx-auto" />
          <p className="font-display mt-8 text-2xl leading-snug font-semibold text-balance sm:text-3xl">
            Four decades on the same desk.
          </p>
        </div>
      </ParallaxBand>

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

      <Suspense fallback={null}>
        <TeamSection />
      </Suspense>
    </div>
  );
}
