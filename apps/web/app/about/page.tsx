import { Suspense } from "react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTeam } from "@/lib/api";
import { values, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description: "The story, values, and team behind the business.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About",
    description: "The story, values, and team behind the business.",
    url: "/about",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description: "The story, values, and team behind the business.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "About" }],
  },
};

async function TeamSection() {
  const team = await getTeam().catch(() => []);
  if (team.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">Meet the team</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {team.map((member) => (
          <Card key={member.id}>
            <div
              className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-semibold text-white"
              role="img"
              aria-label={`${member.name} avatar`}
            >
              <span aria-hidden="true">{member.name.charAt(0)}</span>
            </div>
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-300">{member.title}</p>
            {member.bio ? (
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.bio}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}

function TeamSkeleton() {
  return (
    <section className="mt-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>About</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Focused on results, obsessed with craft</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        We partner with ambitious businesses to build high-quality digital experiences — from strategy through launch and growth.
      </p>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Our story</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Founded by practitioners who built sites for real clients, we bring production-grade thinking to every engagement. The result is a clean, scalable foundation for launches, retainers, and growth experiments.
          </p>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold">What makes us different</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <li>• Beautiful defaults tuned for mobile-first layouts</li>
            <li>• SEO, accessibility, and performance baked in</li>
            <li>• Clear structure for Vercel, Railway, or Docker deployment</li>
          </ul>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Core values</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Suspense fallback={<TeamSkeleton />}>
        <TeamSection />
      </Suspense>
    </div>
  );
}
