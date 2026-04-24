import { Suspense } from "react";
import type { Metadata } from "next";
import { Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTestimonials } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "What our clients say about working with us.",
  alternates: { canonical: "/testimonials" },
  openGraph: {
    title: "Testimonials",
    description: "What our clients say about working with us.",
    url: "/testimonials",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Testimonials" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Testimonials",
    description: "What our clients say about working with us.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Testimonials" }],
  },
};

async function TestimonialsList() {
  const testimonials = await getTestimonials().catch(() => []);
  if (testimonials.length === 0) {
    return <p className="mt-8 text-slate-500 dark:text-slate-400">Testimonials coming soon.</p>;
  }
  const rated = testimonials.filter((t) => t.rating > 0);
  const avgRating = rated.length > 0
    ? (rated.reduce((sum, t) => sum + t.rating, 0) / rated.length).toFixed(1)
    : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    ...(avgRating ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: rated.length,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.authorName },
      reviewBody: t.quote,
      ...(t.rating > 0 ? { reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 } } : {}),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
      {testimonials.map((item) => (
        <Card key={item.id} className="relative">
          <div className="absolute right-5 top-5 rounded-full bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-200">
            <Quote className="size-4" aria-hidden="true" />
          </div>
          <p className="pr-10 text-base leading-7 text-slate-700 dark:text-slate-200">&ldquo;{item.quote}&rdquo;</p>
          <div className="mt-5">
            <p className="font-semibold text-slate-900 dark:text-white">{item.authorName}</p>
            {item.role || item.company ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                <span key={i} className="text-amber-400" aria-hidden="true">★</span>
              ))}
            </div>
          ) : null}
        </Card>
      ))}
      </div>
    </>
  );
}

function TestimonialsSkeleton() {
  return (
    <div className="mt-10 grid animate-pulse gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-44 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Testimonials</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">What clients say</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Kind words from businesses we have had the privilege of working with.
      </p>
      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsList />
      </Suspense>
    </div>
  );
}
