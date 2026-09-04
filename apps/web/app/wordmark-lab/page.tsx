import type { Metadata } from "next";

import { Wordmark } from "@/components/wordmark";
import { WordmarkDrawn } from "@/components/wordmark-drawn";

/**
 * Internal comparison page for the drawn wordmark. Not part of the site:
 * noindex, absent from the sitemap's allowlist, deleted once this is settled.
 */
export const metadata: Metadata = {
  title: "Wordmark lab",
  robots: { index: false, follow: false },
};

export default function WordmarkLabPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-[var(--navy)] dark:text-white">
        Drawn wordmark
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        &ldquo;S&rdquo;, &ldquo;R&rdquo; and &ldquo;Clarke&rdquo; draw in
        parallel — all three groups start together. Reload to replay. The
        letterforms are drawn by hand as centrelines, because a font contains
        outlines and an outline cannot be stroked open.
      </p>

      <section className="mt-16">
        <h2 className="eyebrow">Drawn, at three sizes</h2>
        <div className="mt-6 grid gap-px bg-[var(--border)]">
          <div className="flex items-center gap-10 bg-white p-10">
            <WordmarkDrawn className="h-24 w-auto text-[var(--navy)]" strokeWidth={3.5} />
          </div>
          <div className="flex items-center gap-10 bg-white p-10">
            <WordmarkDrawn className="h-12 w-auto text-[var(--navy)]" strokeWidth={4.5} />
          </div>
          <div className="flex items-center gap-10 bg-[var(--navy-deep)] p-10">
            <WordmarkDrawn className="h-12 w-auto text-white" strokeWidth={4.5} />
          </div>
          {/* Header size — the one that decides it. */}
          <div className="flex items-center gap-10 bg-[var(--navy-deep)] p-10">
            <WordmarkDrawn className="h-6 w-auto text-white" strokeWidth={6} />
            <span className="text-xs text-white/50">header size (24px tall)</span>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="eyebrow">Shipped type wordmark, for comparison</h2>
        <div className="mt-6 grid gap-px bg-[var(--border)]">
          <div className="flex items-center bg-white p-10">
            <Wordmark />
          </div>
          <div className="flex items-center bg-[var(--navy-deep)] p-10">
            <Wordmark onDark />
          </div>
        </div>
      </section>
    </main>
  );
}
