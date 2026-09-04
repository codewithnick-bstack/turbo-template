/**
 * Candidate logo marks, drawn on a 40x40 grid so they sit on the baseline of
 * the "S.R. Clarke" wordmark at text size.
 *
 * A mark has to work at 24px in a browser tab, in one colour, and next to the
 * wordmark without competing with it — so each of these is built from few,
 * heavy strokes rather than fine detail. All four come from the same source as
 * the site's other artwork: structure, drawn as elevation or section.
 */

export type LogoMark = {
  key: string;
  name: string;
  /** What it is, and the argument for it. */
  rationale: string;
  /** Filled shapes, drawn with fill rather than stroke. */
  fills?: string[];
  /** Set "evenodd" when a fill path encloses a counter that must read as a
   *  hole rather than more ink. */
  fillRule?: "evenodd" | "nonzero";
  /** Stroked paths. */
  strokes?: string[];
  /** Stroke width for `strokes`, in grid units. */
  strokeWidth?: number;
};

/**
 * NOTE: app/icon.tsx redraws the chosen mark's geometry by hand, because the
 * OG image runtime cannot mount a React component. Any change to the shipped
 * mark's paths has to be mirrored there.
 */
export const logoMarks: LogoMark[] = [
  {
    key: "monolith",
    name: "Monolith S — as drawn",
    rationale:
      "An S cut as a solid block: the initial built like a plan rather than written. The first round drew more structure and produced a mark that read as a fifth industry icon; this reads as an identity because it is the name.",
    fills: ["M6 6h28v8H16v5h18v20H6v-8h18v-5H6z"],
  },
  {
    key: "monolith-open",
    name: "Monolith S — wider aperture",
    rationale:
      "The same letter with thicker arms and deeper counters. The gaps are what disappear first when a mark is scaled down, so opening them is usually what makes the difference at 16px.",
    fills: ["M5 5h30v9H15v4h20v22H5v-9h20v-4H5z"],
  },
  {
    key: "monolith-square",
    name: "Monolith S — squared",
    rationale:
      "Set on a filled navy square, the way it would appear as an avatar or a favicon. Worth comparing because a mark that floats can look thin in a browser tab even when its silhouette is strong.",
    // One path, evenodd: the letter is a HOLE in the square, so it shows the
    // ground through it. Two same-coloured paths would stack into a blob.
    fillRule: "evenodd",
    fills: ["M2 2h36v36H2zM8 8h24v7H17v4h15v13H8v-7h15v-4H8z"],
  },
]
