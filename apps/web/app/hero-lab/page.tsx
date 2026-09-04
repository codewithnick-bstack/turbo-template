import Link from "next/link";
import type { Metadata } from "next";

import { heroVariants } from "@/lib/hero-variants";

export const metadata: Metadata = {
  title: "Hero grade shoot-out",
  robots: { index: false, follow: false },
};

/**
 * TEMPORARY review page (2026-09-04). Six grades of the same hero loop, all
 * playing at once so they can be compared directly. Each tile links to a
 * full-bleed version at real hero scale.
 */
export default function HeroLabPage() {
  return (
    <div className="bg-[var(--background)] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <p className="eyebrow">Pick one</p>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em] text-[var(--navy)] sm:text-4xl dark:text-white">
          Hero grade shoot-out
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Same footage and same 15-second loop in every tile — only the colour
          grade changes. Open one full screen to judge it at hero scale with the
          headline over it. Tell me the name and I will bake it in and delete
          this page.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {heroVariants.map((variant) => (
            <section key={variant.slug}>
              <div className="relative isolate aspect-video overflow-hidden bg-[var(--navy-deep)]">
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
                <div className="flex h-full items-end p-6">
                  <p className="font-display text-2xl leading-[0.98] font-bold tracking-[-0.03em] text-white sm:text-4xl">
                    Our People Build America.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-lg font-semibold text-[var(--navy)] dark:text-white">
                  {variant.name}
                </h2>
                <Link
                  href={`/hero-lab/${variant.slug}`}
                  className="text-[0.7rem] font-bold tracking-[0.1em] text-[var(--accent-text)] uppercase"
                >
                  Full screen
                </Link>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{variant.note}</p>
              <p className="mt-1 font-mono text-xs text-[var(--muted)]">{variant.filter}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
