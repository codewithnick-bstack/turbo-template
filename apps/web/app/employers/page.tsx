import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
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
        eyebrow={path.audience}
        title={path.title}
        intro={path.description}
        cta={{ label: "Start a search", href: "/contact" }}
      />

      <section className="border-b border-[var(--border)] bg-white py-12 dark:bg-[#071527]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="font-display tnum text-3xl font-semibold text-[#0e2a4f] dark:text-white">{stat.value}</dd>
              <dt className="mt-1 text-xs tracking-wide text-[var(--muted)] uppercase">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-[var(--muted-bg)] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0e2a4f] sm:text-4xl dark:text-white">
            Where we place
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {industries.map((industry) => (
              <div key={industry.slug} className="border border-[var(--border)] bg-[var(--card)] p-8">
                <h3 className="font-display text-xl font-semibold text-[#0e2a4f] dark:text-white">{industry.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
