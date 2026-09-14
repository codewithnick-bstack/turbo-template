import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTeam } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the people behind the work.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team",
    description: "Meet the people behind the work.",
    url: "/team",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Team" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team",
    description: "Meet the people behind the work.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Team" }],
  },
};

async function TeamList() {
  const team = await getTeam().catch(() => []);
  if (team.length === 0) {
    return <p className="mt-8 text-slate-500 dark:text-slate-400">Team page coming soon.</p>;
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {team.map((member) => (
        <Card key={member.id}>
          <div
            className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-lg font-semibold text-white"
            aria-label={`${member.name} avatar`}
            role="img"
          >
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          </div>
          <h2 className="text-lg font-semibold">{member.name}</h2>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">{member.title}</p>
          {member.bio ? (
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.bio}</p>
          ) : null}
          <div className="mt-4 flex gap-3">
            {member.linkedinUrl ? (
              <a href={member.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
                LinkedIn ↗
              </a>
            ) : null}
            {member.twitterUrl ? (
              <a href={member.twitterUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Twitter ↗
              </a>
            ) : null}
          </div>
        </Card>
      ))}
      </div>
    </>
  );
}

function TeamSkeleton() {
  return (
    <div className="mt-10 grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Team</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">The people behind the work</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        A small, focused team with deep experience in design, engineering, and growth.
      </p>
      <Suspense fallback={<TeamSkeleton />}>
        <TeamList />
      </Suspense>
      <div className="mt-12">
        <Link href="/contact">
          <Button>Work with us</Button>
        </Link>
      </div>
    </div>
  );
}
