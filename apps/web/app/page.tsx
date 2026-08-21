import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Metadata } from "next";

import { CountUp } from "@/components/count-up";
import { HeroSection } from "@/components/hero-section";
import { ParallaxBand } from "@/components/parallax-band";
import { Reveal } from "@/components/reveal";
import { ScrollDepthTracker } from "@/components/scroll-depth-tracker";
import { industries, paths, siteConfig, stats, values } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Our People Build America` },
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

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      {/* Proof, the first thing past the fold. Numbers count as they arrive. */}
      <section className="border-b border-[var(--border)] bg-[#08172c] py-14 text-white lg:py-16">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} index={index}>
              <dd className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                <CountUp value={stat.value} />
              </dd>
              <dt className="mt-2 text-xs tracking-[0.14em] text-white/50 uppercase">{stat.label}</dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Why you are here — two doors, nothing else. */}
      <section id="what-we-do" className="bg-white py-20 lg:py-28 dark:bg-[#071527]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            {paths.map((path, index) => (
              <Reveal key={path.audience} index={index} className="relative">
                {/* Oversized ghost numeral as graphic anchor. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -left-2 text-[7rem] leading-none font-bold text-[#0e2a4f]/[0.06] select-none dark:text-white/[0.05]"
                >
                  0{index + 1}
                </span>
                <div className="relative">
                  <div className="h-1 w-14 bg-[#d8261c]" aria-hidden="true" />
                  <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-[#d8261c] uppercase">
                    {path.audience}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-[#0e2a4f] sm:text-4xl dark:text-white">
                    {path.title}
                  </h2>
                  <p className="mt-5 text-base leading-7 text-[var(--muted)]">{path.description}</p>
                  <ul className="mt-7 space-y-3">
                    {path.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                        <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 bg-[#d8261c]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={path.cta.href}
                    className="group mt-9 inline-flex items-center gap-2 border-b-2 border-[#d8261c] pb-1 text-base font-semibold text-[#0e2a4f] dark:text-white"
                  >
                    {path.cta.label}
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are — parallax image band. */}
      <ParallaxBand image="/hero/band.jpg" className="py-24 text-white lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="h-1 w-14 bg-[#d8261c]" aria-hidden="true" />
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              41 years. Approximately 35,000 placements.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/70">
              S.R. Clarke has provided the professionals who built and renovated America&apos;s most
              iconic buildings, bridges, and highways — and the infrastructure around them.
            </p>
            <Link
              href="/why-src"
              className="group mt-9 inline-flex items-center gap-2 border-b-2 border-[#d8261c] pb-1 text-base font-semibold text-white"
            >
              Why SRC
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </ParallaxBand>

      {/* How we can help — the four markets. */}
      <section className="bg-[var(--muted-bg)] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <div className="h-1 w-14 bg-[#d8261c]" aria-hidden="true" />
            <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-[#d8261c] uppercase">
              Industries served
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance text-[#0e2a4f] sm:text-4xl dark:text-white">
              The buildings, bridges, and highways you already know.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
            {industries.map((industry, index) => (
              <Reveal key={industry.slug} index={index}>
                <Link
                  href={`/positions#${industry.slug}`}
                  className="group flex h-full flex-col justify-between bg-[var(--background)] p-9 transition hover:bg-[#0e2a4f] hover:text-white"
                >
                  <div>
                    <span
                      aria-hidden="true"
                      className="text-xs font-semibold tracking-[0.14em] text-[#d8261c]"
                    >
                      0{index + 1}
                    </span>
                    <h3 className="mt-4 text-2xl font-semibold text-[#0e2a4f] group-hover:text-white dark:text-white">
                      {industry.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)] group-hover:text-white/70">
                      {industry.description}
                    </p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#d8261c] group-hover:text-white">
                    View openings
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What we hold ourselves to. */}
      <section className="bg-white py-20 lg:py-28 dark:bg-[#071527]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <dl className="grid gap-x-14 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} index={index}>
                <div className="h-px w-full bg-[var(--border)]" aria-hidden="true" />
                <dt className="mt-5 text-xl font-semibold text-[#0e2a4f] dark:text-white">
                  {value.title}
                </dt>
                <dd className="mt-3 text-sm leading-6 text-[var(--muted)]">{value.description}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing CTA — same two doors as the hero. */}
      <ParallaxBand image="/hero/band-2.jpg" className="py-24 text-white lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              Join us in the mission today.
            </h2>
            <p className="mt-6 text-lg text-white/70">
              One conversation tells you whether we can help.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/career-seekers"
                className="group inline-flex items-center justify-center gap-2 bg-[#d8261c] px-10 py-4.5 text-base font-semibold text-white transition hover:bg-[#b81f16]"
              >
                Get Hired
                <ArrowRight
                  className="size-4 transition group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/employers"
                className="inline-flex items-center justify-center border border-white/30 px-10 py-4.5 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Hire Today
              </Link>
            </div>
            <p className="mt-10 text-sm tracking-wide text-white/40">
              Or call {siteConfig.phone}
            </p>
          </Reveal>
        </div>
      </ParallaxBand>

      <ScrollDepthTracker page="/" />
    </div>
  );
}
