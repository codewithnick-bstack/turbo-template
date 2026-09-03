import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { SectionHeading } from "@/components/section-heading";
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

      <Section>
        <Container>
          <ul className="grid gap-6 md:grid-cols-3">
            {path.bullets.map((bullet, index) => (
              <Reveal key={bullet} index={index}>
                <li className="border-t-2 border-[var(--accent)] bg-[var(--card)] p-6 text-base leading-7 text-[var(--navy)] dark:text-white">
                  {bullet}
                </li>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="muted">
        <Container measure="narrow">
          <SectionHeading eyebrow="FAQ" title="Questions candidates ask" size="lg" />
          <dl className="mt-14 space-y-8">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} index={index} className="border-t border-[var(--border)] pt-5">
                <dt className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-[var(--muted)]">{faq.answer}</dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>
    </div>
  );
}
