/**
 * "S.R. Clarke" drawn as single-stroke skeleton paths — the centreline of each
 * letter rather than its outline, which is what a draw-on animation needs.
 * A font contains outlines, not centrelines, so these are drawn by hand.
 *
 * STRICT METRICS. Every letter is built to the same four lines, because
 * eyeballing them left the caps and the lowercase visibly different sizes:
 *
 *   ascender  y = 10   (l, k)
 *   cap       y = 14   (S, R, C)
 *   x-height  y = 24   (a, r, e)
 *   baseline  y = 46
 *
 * Caps 32 units, x-height 22, ascenders 36. Round letters (S, C, a, e) carry a
 * 1-unit overshoot top and bottom so they look optically equal to the
 * flat-sided ones — the only deliberate deviation from the grid.
 *
 * Proportioned toward Archivo, not a geometric monoline: wide bowls, flat
 * curve tops, vertical stress, and terminals cut on the horizontal. Curves are
 * drawn as flattened arcs rather than circle segments, which is what gives a
 * grotesque its squared shoulders.
 *
 * On terminals specifically: every open curve (S, C, a, r, e) ends on a
 * HORIZONTAL cut, and none of them curl past that. Terminals that hook inward
 * close the aperture and make the letter read as a spiral — that was the main
 * fault in the first three passes.
 *
 * Three groups draw in parallel: "S", "R", "Clarke".
 */

export type StrokeGlyph = {
  /** Letter this path draws, for readability when adjusting spacing. */
  char: string;
  d: string;
};

/**
 * Group 1: "S." — spine of two flattened arcs. The terminals stop on the
 * horizontal at both ends rather than curling in, so the apertures stay open.
 */
export const groupS: StrokeGlyph[] = [
  {
    char: "S",
    d: "M29.5 21.5c-1-4.5-5.5-7.5-11-7.5-6 0-10.5 3.5-10.5 8 0 4.5 3.5 6.5 10.5 8s11 3.5 11 8.5-5 8-11 8c-5.5 0-10-3-11-7.5",
  },
  { char: ".", d: "M36 45.5h.5" },
];

/**
 * Group 2: "R." — the bowl runs from the cap line to the midline at y=31, so
 * it fills the upper half properly; a shallower bowl read as too small against
 * the stem. The leg starts exactly where the bowl closes on the stem.
 */
export const groupR: StrokeGlyph[] = [
  { char: "R", d: "M50 46V14h13.5a8.5 8.5 0 0 1 0 17H50" },
  { char: "R-leg", d: "M63 31l11 15" },
  { char: ".", d: "M80 45.5h.5" },
];

/** Group 3: "Clarke" — the surname, in the accent colour. */
export const groupClarke: StrokeGlyph[] = [
  // C: a closed-in aperture with horizontal terminals. Drawn with the
  // terminals further apart it read as a bracket rather than a letter.
  {
    char: "C",
    d: "M123 22.5c-2.5-5.5-7-8.5-12-8.5-8 0-13.5 7-13.5 16s5.5 16 13.5 16c5 0 9.5-3 12-8.5",
  },
  // l: ascender to baseline.
  { char: "l", d: "M132 10v36" },
  // a: a double-storey "a" built the way it is written — the shoulder comes
  // over from the left, drops as the right stem to the baseline, and the bowl
  // then closes back onto that same stem.
  //
  // Earlier passes drew the bowl as a loop hanging off the stem, which never
  // read as one letter however the widths were adjusted: the bowl has to
  // START and END on the stem. Its top sits at the midline (y=35.5) and the
  // curve stays inside the stem's own width.
  {
    char: "a",
    // Proportions measured off Archivo's own rendered glyph rather than
    // guessed: the letter is nearly SQUARE (aspect 0.93), and the shoulder
    // occupies only the top tenth of it — through the upper middle of the
    // letter the left side is empty and just the right stem carries ink.
    // Every earlier version had a long sweeping shoulder that made the letter
    // lean and read as a single-storey script "a".
    d: "M144.5 26.5c2-1.75 4.5-2.5 7.5-2.5 5.5 0 9 3 9 8V46",
  },
  {
    char: "a-bowl",
    // Leaves the stem at the letter's vertical midpoint, runs out to x=147.5,
    // and closes back on the stem at the baseline. The proportions came from
    // scanning Archivo's own rendered glyph — see the note on the shoulder.
    // Settled here; leave it alone.
    d: "M161 35.5c-9 0-13.5 2-13.5 5s2.5 5 7 5c4.5 0 6.5-2.5 6.5-5.5",
  },
  // r: stem, then a shoulder that lifts to the x-line and stops on the
  // horizontal — cutting it short made the letter look broken.
  { char: "r", d: "M168 46V24.5M168 32.5c0-5 3.5-8 9-8" },
  // k: ascender, and a V whose arm and leg meet the stem at the SAME point on
  // the midline, at matching angles.
  { char: "k", d: "M185.5 10v36M196.5 24.5L185.5 35l11.5 11" },
  // e: crossbar, then round and out to a horizontal terminal. Curling the
  // terminal up closed the aperture.
  {
    char: "e",
    d: "M205.5 35.5h17c0-6.5-3.5-11-8.5-11-5.5 0-9 4.5-9 11s3.5 11 9 11c3.5 0 6.5-1.5 8-4.5",
  },
];

/** The three groups, each drawing concurrently. */
export const strokeGroups: StrokeGlyph[][] = [groupS, groupR, groupClarke];
