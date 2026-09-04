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
    key: "span",
    name: "Span",
    rationale:
      "Two piers and the beam they carry, drawn as a section — an I-beam read end-on. Chosen over a keystone and a plumb bob because it is the only one of the three that still reads at 16px, which is the size that decides a mark: the keystone read as a table at every size, and the plumb line's thread disappears in a browser tab. It is also the closest sibling to the skyline and bridge drawings already on the site.",
    fills: [
      // The deck.
      "M4 16h32v5H4z",
    ],
    strokes: [
      // Piers, and the ground they bear on.
      "M11 21v13M29 21v13",
      "M4 34h32",
    ],
    strokeWidth: 3,
  },
];
