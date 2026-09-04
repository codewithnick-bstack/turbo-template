import type { Metadata } from "next";

import { CtaPair } from "@/components/cta";
import { PageHero } from "@/components/page-hero";
import { ParallaxBand } from "@/components/parallax-band";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { ScaleIn } from "@/components/scale-in";
import { Rule } from "@/components/rule";
import { Section, Container } from "@/components/section";
import { sampleTestimonials } from "@/lib/sample-content";
import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "What clients and candidates say about working with S.R. Clarke.",
  alternates: { canonical: "/testimonials" },
  openGraph: {
    title: "Testimonials",
    description:
      "What clients and candidates say about working with S.R. Clarke.",
    url: "/testimonials",
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
    title: "Testimonials",
    description:
      "What clients and candidates say about working with S.R. Clarke.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  review: sampleTestimonials.map((t) => ({
    "@type": "Review",
    author: { "@type": "Organization", name: t.role },
    reviewBody: t.quote,
  })),
};

// Mid-page quote gets pulled out of the grid to stand alone on the photo band.
const bandQuote = sampleTestimonials[3];
const gridTestimonials = sampleTestimonials.filter((_, i) => i !== 3);

export default function TestimonialsPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        image={photos.concrete}
        eyebrow="Testimonials"
        title="What clients and candidates say."
        intro="41 years of placements, in their own words."
      />

      <Section>
        <Container measure="full">
          <div className="grid gap-6 md:grid-cols-2">
            {gridTestimonials.map((item, index) => {
              const dark = index % 2 === 1;
              return (
                <Reveal
                  key={item.id}
                  index={index}
                  className={cn(index % 3 === 1 && "md:mt-10")}
                >
                  <figure
                    className={cn(
                      "relative h-full border p-8",
                      dark
                        ? "on-dark border-transparent bg-[var(--navy)] text-white"
                        : "border-[var(--border)] bg-[var(--card)]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-display block text-5xl leading-none font-bold",
                        dark ? "text-white/25" : "text-[var(--navy)]/15 dark:text-white/15",
                      )}
                    >
                      &ldquo;
                    </span>
                    <blockquote
                      className={cn(
                        "-mt-4 text-base leading-7",
                        dark ? "text-white" : "text-[var(--navy)] dark:text-white",
                      )}
                    >
                      {item.quote}
                    </blockquote>
                    <figcaption className="mt-6">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          dark ? "text-white" : "text-[var(--navy)] dark:text-white",
                        )}
                      >
                        {item.role}
                      </p>
                      <p
                        className={cn(
                          "eyebrow mt-1",
                          dark && "text-white/55",
                        )}
                      >
                        {item.sector}
                      </p>
                    </figcaption>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </Section>

      {bandQuote ? (
        <ParallaxBand image={photos.bridgeDusk.src} className="py-28 text-white lg:py-40">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <ScaleIn from={1.05}>
              <Reveal>
                <Rule light className="mx-auto" />
                <figure>
                  <blockquote className="font-display mt-8 text-2xl leading-snug font-semibold text-balance sm:text-4xl">
                    &ldquo;{bandQuote.quote}&rdquo;
                  </blockquote>
                  <figcaption>
                    <p className="mt-6 text-sm font-semibold tracking-wide text-white/80 uppercase">
                      {bandQuote.role}
                    </p>
                    <p className="mt-1 text-xs tracking-[0.14em] text-white/50 uppercase">
                      {bandQuote.sector}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            </ScaleIn>
          </div>
        </ParallaxBand>
      ) : null}

      <Section tone="muted" bordered>
        <Container measure="narrow" className="text-center">
          <Reveal>
            <Rule className="mx-auto" />
            <h2 className="font-display mt-6 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
              One conversation tells you whether we can help.
            </h2>
            <CtaPair size="lg" align="center" onDark={false} className="mt-10" />
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
