import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { ParallaxBand } from "@/components/parallax-band";
import { Rule } from "@/components/rule";
import { photos } from "@/lib/photos";
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
        image={photos.superintendent}
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

      {/* Interior pages shipped one image each — the page hero — and then ran
          on type alone. This band breaks the run before the FAQ, using the
          page's own promise rather than a new claim. */}
      <ParallaxBand image={photos.surveyor.src} className="py-24 text-white lg:py-32">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Rule light className="mx-auto" />
          <p className="font-display mt-8 text-2xl leading-snug font-semibold text-balance sm:text-3xl">
            Confidential by default. Your employer never finds out you are
            looking.
          </p>
        </div>
      </ParallaxBand>

      <Section tone="muted">
        <Container measure="narrow">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions candidates ask"
            size="lg"
          />
          <dl className="mt-14 space-y-8">
            {faqs.map((faq, index) => (
              <Reveal
                key={faq.question}
                index={index}
                className="border-t border-[var(--border)] pt-5"
              >
                <dt className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-[var(--muted)]">
                  {faq.answer}
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>
    </div>
  );
}
