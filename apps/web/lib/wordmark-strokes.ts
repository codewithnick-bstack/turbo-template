/**
 * "S.R. Clarke" drawn as single-stroke skeleton paths — the centreline of each
 * letter rather than its outline, which is what a draw-on animation needs.
 * A font contains outlines, not centrelines, so these are drawn by hand.
 *
 * Grid: 221 x 64, baseline at y=46, cap height 32 (y=14 to y=46). The letters
 * are geometric rather than script, to sit with Archivo — a cursive wordmark
 * would draw more prettily and look nothing like the rest of the site.
 *
 * Split into THREE GROUPS that draw in parallel: "S", "R", and "Clarke". All
 * three start together, so the mark assembles in about the time one letter
 * takes rather than crawling left to right through ten of them.
 */

export type StrokeGlyph = {
  /** Letter this path draws, for readability when adjusting spacing. */
  char: string;
  d: string;
};

/** Group 1: "S." */
export const groupS: StrokeGlyph[] = [
  // One stroke: top curve into the spine and out to the bottom curve.
  { char: "S", d: "M26 20c0-4-5-6-9-6s-9 2-9 7 5 6 9 7 9 2 9 7-4 6-9 6-9-2-9-6" },
  { char: ".", d: "M32 45h.5" },
];

/** Group 2: "R." */
export const groupR: StrokeGlyph[] = [
  // Stem and bowl in one movement, then the leg.
  { char: "R", d: "M44 46V14h11a8 8 0 0 1 0 16H44" },
  { char: "R-leg", d: "M55 30l10 16" },
  { char: ".", d: "M70 45h.5" },
];

/** Group 3: "Clarke" — the surname, in the accent colour. */
export const groupClarke: StrokeGlyph[] = [
  // C: open curve, top terminal round to the bottom.
  { char: "C", d: "M104 22a16 16 0 1 0 0 16" },
  { char: "l", d: "M116 12v34" },
  // a: the bowl closes on its own stem, and the stem runs past it to the
  // baseline. Drawn with the bowl meeting the stem it reads as an "o".
  { char: "a", d: "M140 30a8 8 0 1 0 0 12M141 26v20" },
  // r: stem with a shoulder.
  { char: "r", d: "M152 46V26M152 32c0-4 3-6 7-6" },
  // k: ascender, then a single V meeting the stem at one point — two
  // independent diagonals crossing the stem read as a broken letter.
  { char: "k", d: "M168 12v34M178 26l-10 10 10 10" },
  // e: crossbar, then the curve around.
  { char: "e", d: "M188 36h15c0-6-3-10-8-10s-8 4-8 10 3 10 8 10c3 0 6-1 7-3" },
];

/** The three groups, each drawing concurrently. */
export const strokeGroups: StrokeGlyph[][] = [groupS, groupR, groupClarke];
