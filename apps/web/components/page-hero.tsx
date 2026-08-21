import Link from "next/link";
import { ArrowRight } from "lucide-react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cta?: { label: string; href: string };
};

/** Shared header band for interior pages. Same navy/red language as the home hero. */
export function PageHero({ eyebrow, title, intro, cta }: PageHeroProps) {
  return (
    <section className="bg-[#0e2a4f] py-16 text-white lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">{eyebrow}</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{intro}</p>
        {cta ? (
          <Link
            href={cta.href}
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#d8261c] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[#b81f16]"
          >
            {cta.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
