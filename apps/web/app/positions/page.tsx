import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
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

      <section className="bg-white py-16 lg:py-20 dark:bg-[#071527]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {industries.map((industry) => (
              <div
                key={industry.slug}
                id={industry.slug}
                className="flex flex-col justify-between border border-[var(--border)] bg-[var(--card)] p-8"
              >
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#0e2a4f] dark:text-white">{industry.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{industry.description}</p>
                </div>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d8261c]"
                >
                  Ask about openings
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
