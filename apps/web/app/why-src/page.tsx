import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
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
        eyebrow="Why SRC"
        title="Four decades of putting the right people on site."
        intro="S.R. Clarke Consulting Services has provided the professionals who built and renovated America's most iconic buildings, bridges, highways, and surrounding infrastructure."
        cta={{ label: "Talk to a recruiter", href: "/contact" }}
      />

      <section className="border-b border-[var(--border)] bg-white py-12 dark:bg-[#071527]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd className="text-3xl font-semibold text-[#0e2a4f] dark:text-white">{stat.value}</dd>
              <dt className="mt-1 text-xs tracking-wide text-[var(--muted)] uppercase">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-[var(--muted-bg)] py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0e2a4f] sm:text-4xl dark:text-white">
            What we hold ourselves to
          </h2>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="border-t border-[var(--border)] pt-5">
                <dt className="text-lg font-semibold text-[#0e2a4f] dark:text-white">{value.title}</dt>
                <dd className="mt-2 text-sm leading-6 text-[var(--muted)]">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
