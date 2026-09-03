import type { Metadata } from "next";

import { ContactDetailLink } from "@/components/contact-detail-link";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to S.R. Clarke about an open search or a confidential career move. One conversation tells you whether we can help.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact",
    description:
      "Talk to S.R. Clarke about an open search or a confidential career move.",
    url: "/contact",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact",
    description:
      "Talk to S.R. Clarke about an open search or a confidential career move.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

export default function ContactPage() {
  return (
    <div>
      <PageHero
        eyebrow="Contact"
        title="One conversation tells you whether we can help."
        intro="Whether you're hiring or looking, reach out directly or use the form. We respond personally — there is no queue."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal>
              <div className="space-y-1.5 text-base leading-7 text-[var(--muted)]">
                {siteConfig.email ? (
                  <ContactDetailLink
                    href={`mailto:${siteConfig.email}`}
                    type="email"
                    className="block font-medium text-[var(--navy)] hover:text-[var(--accent-text)] dark:text-white"
                  >
                    {siteConfig.email}
                  </ContactDetailLink>
                ) : null}
                {siteConfig.phone ? (
                  <ContactDetailLink
                    href={`tel:${siteConfig.phone}`}
                    type="phone"
                    className="block font-medium text-[var(--navy)] hover:text-[var(--accent-text)] dark:text-white"
                  >
                    {siteConfig.phone}
                  </ContactDetailLink>
                ) : null}
                {siteConfig.location ? <p>{siteConfig.location}</p> : null}
              </div>
            </Reveal>

            <Reveal index={1}>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </Section>
    </div>
  );
}
