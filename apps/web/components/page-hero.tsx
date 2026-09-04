import Image from "next/image";

import { CtaLink } from "@/components/cta";
import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { StaggerWords } from "@/components/stagger-words";
import type { Photo } from "@/lib/photos";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
  /** Full-bleed photograph behind the copy. Leave off for utility pages. */
  image?: Photo;
};

/**
 * Shared header band for interior pages — the "why are you here" line every
 * route opens with. Same navy ground and red rule as the home hero. With a
 * photo it is the page's LCP element, so the image loads eagerly and the
 * scrim is weighted to the left where the copy sits. Short title, one CTA
 * max, scannable in one glance.
 */
export function PageHero({ eyebrow, title, intro, cta, image }: PageHeroProps) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-[var(--navy)] py-16 text-white lg:py-24">
      {image ? (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--navy)] via-[var(--navy)]/80 to-[var(--navy)]/30"
          />
        </>
      ) : null}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Rule />
          <p className="eyebrow mt-6 text-white/60">{eyebrow}</p>
        </Reveal>

        <StaggerWords
          as="h1"
          text={title}
          className="font-display mt-5 max-w-3xl text-4xl font-bold tracking-[-0.02em] text-balance sm:text-5xl"
        />

        <Reveal index={1}>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            {intro}
          </p>
        </Reveal>

        {cta ? (
          <Reveal index={2} className="mt-8">
            <CtaLink
              href={cta.href}
              label={cta.label}
              variant="primary"
              size="lg"
              withArrow
            />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
