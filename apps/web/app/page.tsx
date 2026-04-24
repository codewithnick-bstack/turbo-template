import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Metadata } from "next";

import { HeroSection } from "@/components/hero-section";
import { TestimonialCarousel } from "@/components/testimonial-carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTestimonials } from "@/lib/api";
import { faqs, features, siteConfig } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — ${siteConfig.description}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }],
  },
};

async function TestimonialsSection() {
  const testimonials = await getTestimonials().catch(() => []);
  if (testimonials.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6">
        <Badge>Testimonials</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Trusted by modern service brands</h2>
      </div>
      <TestimonialCarousel testimonials={testimonials} />
    </section>
  );
}

function TestimonialsSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-1/2 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-36 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Badge>Features</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Everything needed for fast, premium launches</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Suspense fallback={<TestimonialsSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-slate-950 text-white dark:bg-slate-900">
            <Badge className="border-white/20 bg-white/10 text-white">Need a quick launch?</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Use this starter as your new client baseline.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Swap branding, update service copy, add blog posts, and deploy to Vercel and Railway in a single afternoon.
            </p>
            <div className="mt-6">
              <Link href="/contact">
                <Button variant="secondary">
                  Book a kickoff
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
