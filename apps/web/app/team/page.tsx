import { Suspense } from "react";
import type { Metadata } from "next";

import { CtaLink } from "@/components/cta";
import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { getTeam } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The recruiters behind S.R. Clarke's 41 years of construction placements.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team",
    description:
      "The recruiters behind S.R. Clarke's 41 years of construction placements.",
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
      "The recruiters behind S.R. Clarke's 41 years of construction placements.",
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

async function TeamList() {
  const team = await getTeam().catch(() => []);
  if (team.length === 0) {
    return <p className="text-[var(--muted)]">Team page coming soon.</p>;
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: team.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: m.name,
        jobTitle: m.title ?? undefined,
        description: m.bio ?? undefined,
        sameAs: [m.linkedinUrl, m.twitterUrl].filter(Boolean),
        worksFor: { "@type": "Organization", name: siteConfig.name },
      },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((member, index) => (
          <Reveal key={member.id} index={index}>
            <div className="h-full border-t-2 border-[var(--accent)] bg-[var(--card)] p-6">
              <h2 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                {member.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--accent-text)]">
                {member.title}
              </p>
              {member.bio ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {member.bio}
                </p>
              ) : null}
              <div className="mt-4 flex gap-4">
                {member.linkedinUrl ? (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase hover:text-[var(--navy)] dark:hover:text-white"
                  >
                    LinkedIn ↗
                  </a>
                ) : null}
                {member.twitterUrl ? (
                  <a
                    href={member.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase hover:text-[var(--navy)] dark:hover:text-white"
                  >
                    Twitter ↗
                  </a>
                ) : null}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

function TeamSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-[var(--muted-bg)]" />
      ))}
    </div>
  );
}

export default function TeamPage() {
  return (
    <div>
      <PageHero
        image={photos.siteMeeting}
        eyebrow="Team"
        title="The desk behind 35,000 placements."
        intro="Recruiters who know the projects, the pay bands, and the managers you'd be working for."
      />
      <Section>
        <Container>
          <Suspense fallback={<TeamSkeleton />}>
            <TeamList />
          </Suspense>
          <div className="mt-14">
            <CtaLink
              href="/contact"
              label="Work with us"
              variant="outlineDark"
              withArrow
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}
