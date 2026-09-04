import type { Metadata } from "next";

import { LogoMark } from "@/components/logo-mark";
import { logoMarks } from "@/lib/logo-marks";

/**
 * Internal comparison page for choosing a logo mark. Not part of the site:
 * noindex, absent from the sitemap, and deleted once a mark is picked.
 *
 * Each candidate is shown at the sizes that actually decide it — beside the
 * wordmark at header size, alone as a favicon, and reversed out on navy —
 * because a mark that works at 40px often falls apart at 16px.
 */
export const metadata: Metadata = {
  title: "Logo lab",
  robots: { index: false, follow: false },
};

const FAVICON_SIZES = [16, 24, 32];

function Wordmark({ variant, light = false }: { variant: string; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark
        variant={variant}
        className={light ? "size-7 text-[#f76b60]" : "size-7 text-[var(--accent)]"}
      />
      <span className="font-display flex items-baseline text-lg leading-none font-bold tracking-[-0.02em]">
        <span className={light ? "text-white" : "text-[var(--navy)]"}>S.R.</span>
        <span className={light ? "ml-1.5 text-[#f76b60]" : "ml-1.5 text-[var(--accent-text)]"}>
          Clarke
        </span>
      </span>
    </span>
  );
}

export default function LogoLabPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-[var(--navy)] dark:text-white">
        Logo mark candidates
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--muted)]">
        Second round. The first attempt drew more structure and produced a
        mark that read as a fifth industry icon rather than an identity — so
        these come from the initial and from the act of placing someone
        instead. Judge them at the favicon sizes first: that is where marks
        fail, but surviving 16px is the floor, not the point.
      </p>

      <div className="mt-16 space-y-20">
        {logoMarks.map((mark, index) => (
          <section key={mark.key}>
            <div className="flex items-baseline gap-3">
              <span className="font-display tnum text-sm font-bold text-[var(--accent-text)]">
                0{index + 1}
              </span>
              <h2 className="font-display text-2xl font-semibold text-[var(--navy)] dark:text-white">
                {mark.name}
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              {mark.rationale}
            </p>

            <div className="mt-8 grid gap-px bg-[var(--border)] sm:grid-cols-2">
              {/* Large, on light. */}
              <div className="flex min-h-44 items-center justify-center bg-white p-8">
                <LogoMark variant={mark.key} className="size-24 text-[var(--navy)]" />
              </div>
              {/* Large, reversed on navy — most of the site's chrome is dark. */}
              <div className="flex min-h-44 items-center justify-center bg-[var(--navy-deep)] p-8">
                <LogoMark variant={mark.key} className="size-24 text-white" />
              </div>
              {/* In the accent red, which is how it would sit in the header. */}
              <div className="flex min-h-44 items-center justify-center bg-white p-8">
                <LogoMark variant={mark.key} className="size-24 text-[var(--accent)]" />
              </div>
              {/* Favicon sizes: the real test. */}
              <div className="flex min-h-44 flex-wrap items-center justify-center gap-8 bg-[var(--muted-bg)] p-8">
                {FAVICON_SIZES.map((size) => (
                  <span key={size} className="flex flex-col items-center gap-2">
                    <LogoMark
                      variant={mark.key}
                      className="text-[var(--navy)] dark:text-white"
                      style={{ width: size, height: size }}
                    />
                    <span className="text-[0.65rem] tracking-wide text-[var(--muted)]">
                      {size}px
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Beside the wordmark, at header size, on both grounds. */}
            <div className="mt-px grid gap-px bg-[var(--border)] sm:grid-cols-2">
              <div className="flex min-h-24 items-center bg-white p-8">
                <Wordmark variant={mark.key} />
              </div>
              <div className="flex min-h-24 items-center bg-[var(--navy-deep)] p-8">
                <Wordmark variant={mark.key} light />
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-[var(--border)] pt-10">
        <h2 className="font-display text-xl font-semibold text-[var(--navy)] dark:text-white">
          No mark (current)
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          The wordmark as it ships today, for comparison. Worth checking whether
          a mark actually earns its place — plenty of good professional-services
          brands are wordmark only.
        </p>
        <div className="mt-8 grid gap-px bg-[var(--border)] sm:grid-cols-2">
          <div className="flex min-h-24 items-center bg-white p-8">
            <span className="font-display flex items-baseline text-lg leading-none font-bold tracking-[-0.02em]">
              <span className="text-[var(--navy)]">S.R.</span>
              <span className="ml-1.5 text-[var(--accent-text)]">Clarke</span>
            </span>
          </div>
          <div className="flex min-h-24 items-center bg-[var(--navy-deep)] p-8">
            <span className="font-display flex items-baseline text-lg leading-none font-bold tracking-[-0.02em]">
              <span className="text-white">S.R.</span>
              <span className="ml-1.5 text-[#f76b60]">Clarke</span>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
