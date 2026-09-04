import { Suspense } from "react";
import type { Metadata } from "next";
import { Quote } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { photos } from "@/lib/photos";
import { Reveal } from "@/components/reveal";
import { Section, Container } from "@/components/section";
import { getTestimonials } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

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

async function TestimonialsList() {
  const testimonials = await getTestimonials().catch(() => []);
  if (testimonials.length === 0) {
    return <p className="text-[var(--muted)]">Testimonials coming soon.</p>;
  }
  const rated = testimonials.filter((t) => t.rating > 0);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, t) => sum + t.rating, 0) / rated.length).toFixed(1)
      : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating,
            reviewCount: rated.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.authorName },
      reviewBody: t.quote,
      ...(t.rating > 0
        ? {
            reviewRating: {
              "@type": "Rating",
              ratingValue: t.rating,
              bestRating: 5,
            },
          }
        : {}),
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((item, index) => (
          <Reveal key={item.id} index={index}>
            <div className="relative h-full border border-[var(--border)] bg-[var(--card)] p-8">
              <Quote
                className="absolute top-6 right-6 size-5 text-[var(--accent)]/40"
                aria-hidden="true"
              />
              <p className="pr-8 text-base leading-7 text-[var(--navy)] dark:text-white">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-5">
                <p className="font-semibold text-[var(--navy)] dark:text-white">
                  {item.authorName}
                </p>
                {item.role || item.company ? (
                  <p className="text-sm text-[var(--muted)]">
                    {[item.role, item.company].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>
              {item.rating > 0 ? (
                <div
                  className="mt-3 flex gap-0.5"
                  role="img"
                  aria-label={`Rating: ${item.rating} out of 5 stars`}
                >
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <span
                      key={i}
                      className="text-[var(--accent-text)]"
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-44 bg-[var(--muted-bg)]" />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div>
      <PageHero
        image={photos.concrete}
        eyebrow="Testimonials"
        title="What clients and candidates say."
        intro="41 years of placements, in their own words."
      />
      <Section>
        <Container>
          <Suspense fallback={<TestimonialsSkeleton />}>
            <TestimonialsList />
          </Suspense>
        </Container>
      </Section>
    </div>
  );
}
