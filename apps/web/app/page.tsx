import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Metadata } from "next";

import { CountUp } from "@/components/count-up";
import { CtaPair, TextLink } from "@/components/cta";
import { Drift } from "@/components/drift";
import { HeroSection } from "@/components/hero-section";
import { ParallaxBand } from "@/components/parallax-band";
import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { ScaleIn } from "@/components/scale-in";
import { ScrollDepthTracker } from "@/components/scroll-depth-tracker";
import { StaggerWords } from "@/components/stagger-words";
import { industryPhotos, pathPhotos, photos } from "@/lib/photos";
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
    title: siteConfig.name,
    description: siteConfig.description,
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

export default function HomePage() {
  return (
    <div>
      <HeroSection />

      {/* Proof, first thing past the fold. Wide measure, hairline dividers. */}
      <section className="on-dark border-b border-[var(--border)] bg-[var(--navy-deep)] text-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-10">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              index={index}
              className={
                index === 0
                  ? "py-12 lg:py-16"
                  : "border-l border-white/10 py-12 pl-6 lg:py-16 lg:pl-10"
              }
            >
              <dd className="font-display tnum text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                <CountUp value={stat.value} />
              </dd>
              <dt className="mt-3 text-[0.7rem] font-semibold tracking-[0.14em] text-white/45 uppercase">
                {stat.label}
              </dt>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* Two doors. Narrow intro column, then a wide split — the measure
          changes so the page does not read as one repeated container. */}
      <section
        id="what-we-do"
        className="bg-[var(--background)] py-24 lg:py-32"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal>
            <Rule />
            <p className="eyebrow mt-6">Two ways in</p>
          </Reveal>
          <StaggerWords
            text="Why are you here?"
            className="font-display mt-5 text-4xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-5xl dark:text-white"
          />
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            {paths.map((path, index) => {
              const photo = pathPhotos[index] ?? photos.siteMeeting;
              return (
                // Opposite drift on the two columns: they separate by a few
                // pixels as the section passes, which reads as depth without
                // either column ever looking misaligned.
                <Drift
                  key={path.audience}
                  distance={index === 0 ? -18 : 18}
                  className="relative"
                >
                <Reveal index={index} className="relative">
                  {/* Each door opens on a photograph of the person behind it. */}
                  <figure className="relative mb-10 aspect-[4/3] overflow-hidden">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </figure>
                  <span
                    aria-hidden="true"
                    className="font-display pointer-events-none absolute -top-14 -left-3 text-[9rem] leading-none font-bold text-[var(--navy)]/[0.05] select-none dark:text-white/[0.04]"
                  >
                    0{index + 1}
                  </span>
                  <div className="relative">
                    <p className="eyebrow">{path.audience}</p>
                    <h3 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
                      {path.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base leading-7 text-[var(--muted)]">
                      {path.description}
                    </p>
                    <ul className="mt-8 space-y-0">
                      {path.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="border-t border-[var(--border)] py-4 text-sm leading-6 text-[var(--muted)]"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <TextLink
                      href={path.cta.href}
                      label={path.cta.label}
                      className="mt-9"
                    />
                  </div>
                </Reveal>
                </Drift>
              );
            })}
          </div>
        </div>
      </section>

      {/* The number as the graphic. Full-bleed, cropped, nothing else. */}
      <section className="relative overflow-hidden border-y border-[var(--border)] bg-[var(--muted-bg)] py-24 lg:py-32">
        <span
          aria-hidden="true"
          className="font-display tnum pointer-events-none absolute -top-8 -right-4 text-[clamp(9rem,26vw,22rem)] leading-[0.8] font-bold text-[var(--navy)]/[0.07] select-none lg:-top-16 dark:text-white/[0.05]"
        >
          41
        </span>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <Reveal>
            <Rule />
          </Reveal>
          <StaggerWords
            text="Forty-one years on American jobsites."
            className="font-display mt-7 text-4xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-5xl lg:text-6xl dark:text-white"
          />
          <Reveal index={1}>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Approximately 35,000 placements. The professionals who built and
              renovated America&apos;s most iconic buildings, bridges, and
              highways came through this desk.
            </p>
            <TextLink href="/why-src" label="Why SRC" className="mt-9" />
          </Reveal>
        </div>
      </section>

      {/* Industries. Offset heading against a full-width hairline grid. */}
      <section className="bg-[var(--background)] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:items-start">
            {/* The heading holds while the four tiles scroll past it, so the
                section keeps its label as you read down. Desktop only: on a
                phone the columns stack and a sticky heading would eat the
                viewport the tiles need. */}
            <Reveal className="lg:sticky lg:top-[calc(var(--header-height)+3rem)]">
              <Rule />
              <p className="eyebrow mt-6">Industries served</p>
              <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
                The buildings, bridges, and highways you already know.
              </h2>
            </Reveal>

            <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
              {industries.map((industry, index) => {
                const photo =
                  industryPhotos[industry.slug] ?? photos.commercialHighrise;
                return (
                  <Reveal key={industry.slug} index={index}>
                    {/* Photo tile: the picture does the work, the scrim keeps
                      the type at contrast, hover pulls the picture forward. */}
                    <Link
                      href={`/positions#${industry.slug}`}
                      className="group relative isolate flex h-full min-h-[18rem] flex-col justify-between overflow-hidden p-8 text-white"
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                        className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--navy-deep)] via-[var(--navy-deep)]/75 to-[var(--navy-deep)]/35 transition-opacity duration-300 group-hover:opacity-85"
                      />
                      <div>
                        <span
                          aria-hidden="true"
                          className="font-display tnum text-xs font-bold tracking-[0.14em] text-[#f76b60]"
                        >
                          0{index + 1}
                        </span>
                        <h3 className="font-display mt-4 text-xl font-semibold">
                          {industry.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/75">
                          {industry.description}
                        </p>
                      </div>
                      <span className="mt-8 inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.1em] text-white uppercase">
                        View openings
                        <ArrowRight
                          className="size-3.5 transition-transform duration-[var(--duration-micro)] group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Image band. Narrow copy column against the photograph. */}
      <ParallaxBand
        image="/hero/band.jpg"
        className="py-28 text-white lg:py-40"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <ScaleIn className="max-w-xl" from={1.06}>
            <Reveal>
              <Rule light />
              <p className="eyebrow mt-6 text-white/50">How we work</p>
              <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Subject matter experts, not resume forwarders.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/70">
                We know the projects, the pay bands, and the managers you would
                be working for. That is the difference between a submittal and a
                placement.
              </p>
            </Reveal>
          </ScaleIn>
        </div>
      </ParallaxBand>

      {/* Values. Four columns, hairline tops, wide measure. */}
      <section className="bg-[var(--background)] py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <Reveal className="max-w-2xl">
            <Rule />
            <h2 className="font-display mt-6 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
              What we hold ourselves to.
            </h2>
          </Reveal>
          <dl className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} index={index}>
                <span
                  aria-hidden="true"
                  className="block h-px w-full bg-[var(--border)]"
                />
                <dt className="font-display mt-6 text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {value.title}
                </dt>
                <dd className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {value.description}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing. Centred here on purpose — it is the one moment that should
          feel like an address to the reader rather than a column of copy. */}
      <ParallaxBand
        image={photos.bridgeDusk.src}
        className="py-28 text-white lg:py-40"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <StaggerWords
            text="Join us in the mission today."
            className="font-display text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-6xl"
          />
          <Reveal index={1}>
            <p className="mt-7 text-lg text-white/70">
              One conversation tells you whether we can help.
            </p>
            <CtaPair size="lg" align="center" className="mt-12" />
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
