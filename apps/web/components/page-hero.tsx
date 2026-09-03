import { CtaLink } from "@/components/cta";
import { Reveal } from "@/components/reveal";
import { Rule } from "@/components/rule";
import { StaggerWords } from "@/components/stagger-words";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
};

/**
 * Shared header band for interior pages — the "why are you here" line every
 * route opens with. Same navy ground and red rule as the home hero, but
 * static (no photo): the reference sites Nikhil pointed at use a color band
 * here, reserving the full-bleed photo treatment for the homepage alone.
 * Short title, one CTA max, scannable in one glance.
 */
export function PageHero({ eyebrow, title, intro, cta }: PageHeroProps) {
  return (
    <section className="on-dark bg-[var(--navy)] py-16 text-white lg:py-20">
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
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{intro}</p>
        </Reveal>

        {cta ? (
          <Reveal index={2} className="mt-8">
            <CtaLink href={cta.href} label={cta.label} variant="primary" size="lg" withArrow />
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
