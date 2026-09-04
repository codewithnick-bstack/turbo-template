import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CtaLink } from "@/components/cta";
import { findVariant, heroVariants } from "@/lib/hero-variants";
import { hero } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Hero grade preview",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return heroVariants.map((variant) => ({ slug: variant.slug }));
}

/**
 * TEMPORARY (2026-09-04). One grade at real hero scale, with the actual
 * headline, subline and CTAs over it, so the choice is made on the thing
 * itself rather than on a thumbnail.
 */
export default async function HeroVariantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variant = findVariant(slug);
  if (!variant) notFound();

  return (
    <div>
      <section className="on-dark relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[var(--navy-deep)]">
        <video
          className="absolute inset-0 -z-20 size-full object-cover"
          poster={`/hero/variants/${variant.slug}.jpg`}
          width={1600}
          height={900}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={`/hero/variants/${variant.slug}.mp4`} type="video/mp4" />
        </video>
        <div className={`absolute inset-0 -z-10 ${variant.scrim[0]}`} aria-hidden="true" />
        <div className={`absolute inset-0 -z-10 ${variant.scrim[1]}`} aria-hidden="true" />

        <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <h1 className="font-display max-w-5xl text-[clamp(2.75rem,8.5vw,6.5rem)] leading-[0.98] font-bold tracking-[-0.035em] text-white">
            Our People Build America.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed font-light text-white/85 sm:text-xl">
            The towers. The bridges. The highways.
          </p>
          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <CtaLink
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              variant="primary"
              size="lg"
              withArrow
            />
            <CtaLink
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              variant="outline"
              size="lg"
            />
          </div>
        </div>
      </section>

      <div className="bg-[var(--background)] py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 sm:px-6 lg:px-8">
          <p className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
            {variant.name}
          </p>
          <p className="font-mono text-xs text-[var(--muted)]">{variant.filter}</p>
          <Link
            href="/hero-lab"
            className="ml-auto text-[0.7rem] font-bold tracking-[0.1em] text-[var(--accent-text)] uppercase"
          >
            All grades
          </Link>
        </div>
        <div className="mx-auto mt-6 flex max-w-6xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
          {heroVariants.map((other) => (
            <Link
              key={other.slug}
              href={`/hero-lab/${other.slug}`}
              className={`border px-4 py-2 text-[0.7rem] font-bold tracking-[0.1em] uppercase ${
                other.slug === variant.slug
                  ? "border-[var(--accent)] text-[var(--accent-text)]"
                  : "border-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {other.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
