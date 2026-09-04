/**
 * TEMPORARY — hero grade shoot-out for Nikhil to pick from (2026-09-04).
 * Delete this file, /hero-lab, and public/hero/variants once a grade is chosen
 * and baked into public/hero/hero.mp4.
 *
 * Every variant is the same 15s loop (first 7.5s of the source, mirrored);
 * only the colour grade differs. `scrim` is the overlay pair the hero uses, so
 * a lighter grade can be paired with a heavier scrim and vice versa.
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
    slug: "untouched",
    name: "Untouched",
    note: "The source clip, no grade. The baseline everything else is judged against.",
    filter: "none",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "teal",
    name: "Deep teal",
    note: "Current pick. Cooler and richer: gamma 0.95, contrast 1.10, saturation 1.30.",
    filter: "gamma 0.95 · contrast 1.10 · saturation 1.30 · cool balance",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "cinematic",
    name: "Cinematic",
    note: "Darker and flatter in the highlights. Restrained, closer to film.",
    filter: "gamma 0.92 · contrast 1.14 · saturation 1.18 · brightness −0.02",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "noir",
    name: "Near-monochrome",
    note: "Colour pulled almost out, cool cast left in. The type carries the page.",
    filter: "saturation 0.35 · gamma 0.92 · contrast 1.20 · cool balance",
    scrim: SCRIM_LIGHT,
  },
  {
    slug: "warm",
    name: "Warm",
    note: "Golden-hour lean. Reads friendlier, less corporate-cold.",
    filter: "gamma 0.97 · contrast 1.08 · saturation 1.15 · warm balance",
    scrim: SCRIM_STANDARD,
  },
  {
    slug: "punch",
    name: "High contrast",
    note: "S-curve. Blacks crushed, windows hot. The most aggressive option.",
    filter: "S-curve · saturation 1.35",
    scrim: SCRIM_LIGHT,
  },
];

export function findVariant(slug: string) {
  return heroVariants.find((v) => v.slug === slug);
}
