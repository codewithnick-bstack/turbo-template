import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { audiencePaths, faqs } from "@/lib/site-data";

const path = audiencePaths.candidate;

export const metadata: Metadata = {
  title: "For Career Seekers",
  description:
    "Confidential construction and infrastructure job search. Roles that are never posted publicly, and straight answers on comp and scope.",
};

export default function CareerSeekersPage() {
  return (
    <div>
      <PageHero
        eyebrow={path.audience}
        title={path.title}
        intro={path.description}
        cta={{ label: "Send your resume", href: "/contact" }}
      />

      <section className="bg-white py-16 lg:py-20 dark:bg-[#071527]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul className="grid gap-6 md:grid-cols-3">
            {path.bullets.map((bullet) => (
              <li
                key={bullet}
                className="border-t-2 border-[#d8261c] bg-[var(--card)] p-6 text-base leading-7 text-[#0e2a4f] dark:text-white"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--muted-bg)] py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#0e2a4f] sm:text-4xl dark:text-white">
            Questions candidates ask
          </h2>
          <dl className="mt-10 space-y-8">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-t border-[var(--border)] pt-5">
                <dt className="text-lg font-semibold text-[#0e2a4f] dark:text-white">{faq.question}</dt>
                <dd className="mt-2 text-base leading-7 text-[var(--muted)]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
