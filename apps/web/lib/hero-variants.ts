/**
 * TEMPORARY — hero grade shoot-out for Nikhil to pick from (2026-09-04).
 * Delete this file, /hero-lab, and public/hero/variants once a grade is chosen
 * and baked into public/hero/hero.mp4.
 *
 * Round 2: Nikhil picked the high-contrast S-curve but called it too strong,
 * and asked for the full clip rather than the trimmed skyline half. So every
 * variant here is the whole 16.6s source (skyline into construction, no
 * mirroring) and the curve steps down from the round-1 "punch" — 90% of that
 * strength down to 30%, plus the ungraded clip as the floor.
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
    slug: "c90",
    name: "90% — softest",
    note: "Barely any S-curve. Closest to the untouched clip while still shaped.",
    filter: "curve 0.30→0.26 / 0.70→0.75 · saturation 1.12",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "c75",
    name: "75%",
    note: "Gentle shaping. Shadows stay open, highlights barely lift.",
    filter: "curve 0.30→0.27 / 0.70→0.74 · saturation 1.18",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "c60",
    name: "60%",
    note: "The middle of the range. Noticeable contrast, nothing crushed.",
    filter: "curve 0.29→0.24 / 0.71→0.77 · saturation 1.22",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "c45",
    name: "45%",
    note: "Getting punchy. Blacks deepen, windows start to glow.",
    filter: "curve 0.28→0.23 / 0.72→0.79 · saturation 1.26",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "c30",
    name: "30% — closest to round 1",
    note: "Nearly the grade you liked, pulled back a notch.",
    filter: "curve 0.28→0.21 / 0.72→0.81 · saturation 1.30",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "full",
    name: "Untouched",
    note: "The full source clip, no grade at all. The floor for comparison.",
    filter: "none",
    scrim: SCRIM_STANDARD,
  },
];

export function findVariant(slug: string) {
  return heroVariants.find((v) => v.slug === slug);
}
