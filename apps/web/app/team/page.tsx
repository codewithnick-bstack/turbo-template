import type { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/page-hero";
import { ProcessMark } from "@/components/process-mark";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
import { sampleTeam } from "@/lib/sample-content";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The recruiters behind 41 years of construction and infrastructure placements — experts who know the projects, pay bands, and hiring managers.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team",
    description:
      "The recruiters behind 41 years of construction and infrastructure placements — experts who know the projects, pay bands, and hiring managers.",
    url: "/team",
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
    title: "Team",
    description:
      "The recruiters behind 41 years of construction and infrastructure placements — experts who know the projects, pay bands, and hiring managers.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: sampleTeam.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Person",
      jobTitle: m.role,
      description: m.bio,
      worksFor: { "@type": "Organization", name: siteConfig.name },
    },
  })),
};

const deskSteps = [
  {
    mark: "singleDesk",
    title: "One search, one recruiter",
    description:
      "A single point of contact runs a search end to end — sourcing, vetting, and reference checks all pass through the same desk.",
  },
  {
    mark: "vetted",
    title: "Vetted before you see them",
    description:
      "Every candidate presented has already cleared reference interviews and a background check, not just a resume screen.",
  },
  {
    mark: "confidential",
    title: "Confidential by default",
    description:
      "Candidate identities and employer searches stay private until both sides agree to a specific introduction.",
  },
];

/** A quiet placeholder tile for a team member with no photo — initials on a navy field. */
function InitialsTile({ role }: { role: string }) {
  const initials = role
    .split(" ")
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("") || role.slice(0, 2).toUpperCase();

  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-[var(--navy)]">
      <span className="font-display text-4xl font-semibold tracking-[-0.02em] text-white/80">
        {initials}
      </span>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        image={photos.safetyBriefing}
        eyebrow="Team"
        title="The desk behind 35,000 placements."
        intro="Recruiters who know the projects, the pay bands, and the managers you'd be working for."
      />

      <Section>
        <Container measure="narrow">
          <Reveal>
            <p className="text-lg leading-8 text-[var(--muted)]">
              S.R. Clarke runs as one desk, not a roster of independent
              recruiters competing for the same candidates. For 41 years that
              has meant a single search process — sourcing, vetting,
              reference checks, and negotiation support — applied
              consistently whether the role is a field superintendent or a
              division president.
            </p>
          </Reveal>
        </Container>
      </Section>

      <Section tone="muted" bordered>
        <Container measure="full">
          <SectionHeading eyebrow="Who we are" title="Who you'll work with." size="lg" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sampleTeam.map((member, index) => (
              <Reveal key={member.id} index={index}>
                <div className="h-full border border-[var(--border)] bg-[var(--card)]">
                  {member.photo ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={member.photo.src}
                        alt={member.photo.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        loading="lazy"
                        className="object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[var(--navy)]/45"
                      />
                    </div>
                  ) : (
                    <InitialsTile role={member.role} />
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                      {member.role}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[var(--accent-text)]">
                      {member.focus}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {member.bio}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {member.sectors.map((sector) => (
                        <li
                          key={sector}
                          className="border border-[var(--border)] px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.08em] text-[var(--muted)] uppercase"
                        >
                          {sector}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="One search, one recruiter."
            className="max-w-2xl"
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {deskSteps.map((step, index) => (
              <Reveal key={step.title} index={index}>
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="font-display tnum block text-sm font-bold text-[var(--accent-text)]"
                  >
                    0{index + 1}
                  </span>
                  <ProcessMark
                    name={step.mark}
                    className="size-11 stroke-[var(--navy)]/35 dark:stroke-white/30"
                  />
                </div>
                <h3 className="font-display mt-3 text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
