/**
 * TEMPORARY — hero grade shoot-out for Nikhil to pick from (2026-09-04).
 * Delete this file, /hero-lab, and public/hero/variants once a grade is chosen
 * and baked into public/hero/hero.mp4.
 *
 * Round 3: back to the skyline half (0-7.5s, mirrored so the loop never jumps
 * from sunset to night), slowed down. Two grade strengths from the round-2
 * step-down — 45% and 60% of the original high-contrast curve — crossed with
 * three speeds. Everything is re-timed with setpts and re-sampled to 30fps.
 */
export type HeroVariant = {
  slug: string;
  name: string;
  note: string;
  filter: string;
  /** Tailwind arbitrary gradients: [vertical, horizontal]. */
  scrim: [string, string];
};

const SCRIM_STANDARD: [string, string] = [
  "bg-[linear-gradient(to_top,rgba(8,23,44,0.84)_0%,rgba(8,23,44,0.66)_45%,rgba(8,23,44,0.28)_100%)]",
  "bg-[linear-gradient(to_right,rgba(8,23,44,0.58)_0%,rgba(8,23,44,0.20)_52%,transparent_80%)]",
];

const SCRIM_LIGHT: [string, string] = [
  "bg-[linear-gradient(to_top,rgba(8,23,44,0.72)_0%,rgba(8,23,44,0.50)_45%,rgba(8,23,44,0.16)_100%)]",
  "bg-[linear-gradient(to_right,rgba(8,23,44,0.46)_0%,rgba(8,23,44,0.14)_52%,transparent_80%)]",
];

export const heroVariants: HeroVariant[] = [
  {
    slug: "s15-g45",
    name: "1.5× slower · punchy",
    note: "22s loop. Still moves, just less hurried than the original.",
    filter: "curve 45% · saturation 1.26 · 22.5s",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "s20-g45",
    name: "2× slower · punchy",
    note: "30s loop. Reads as a slow drift rather than a timelapse.",
    filter: "curve 45% · saturation 1.26 · 30s",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "s30-g45",
    name: "3× slower · punchy",
    note: "45s loop. Nearly still — the sky changes without you noticing.",
    filter: "curve 45% · saturation 1.26 · 45s",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "s15-g60",
    name: "1.5× slower · softer",
    note: "Same speed as the first, one grade step gentler.",
    filter: "curve 60% · saturation 1.22 · 22.5s",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "s20-g60",
    name: "2× slower · softer",
    note: "The middle of this round on both axes.",
    filter: "curve 60% · saturation 1.22 · 30s",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "s30-g60",
    name: "3× slower · softer",
    note: "Slowest and gentlest. Closest to a still photograph.",
    filter: "curve 60% · saturation 1.22 · 45s",
    scrim: SCRIM_STANDARD,
  },
];

export function findVariant(slug: string) {
  return heroVariants.find((v) => v.slug === slug);
}
