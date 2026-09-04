/**
 * Line-art marks in the same family as the industry glyphs and the skyline:
 * structural, drawn as elevations and sections rather than as pictures, so the
 * whole set reads as one hand.
 *
 * Each entry is an ordered list of paths — they draw in sequence, and the
 * order is the order the real thing would be built or surveyed in. Stroke
 * colour and width come from the rendering component.
 */

/**
 * 48x48 grid, matching industryGlyphs. Keys name the promise each mark sits
 * beside on /team, so they track that copy rather than a generic funnel.
 */
export const processMarks: Record<string, string[]> = {
  /** One recruiter, one search: a single line running to a single desk. */
  singleDesk: ["M8 40h32", "M14 40V22h20v18", "M24 22v-8", "M17 14h14"],
  /** Vetted before you see them: a checked sheet, marked in the margin. */
  vetted: [
    "M12 6h24v36H12z",
    "M17 15h14M17 22h14M17 29h9",
    "M28 33l4 4 7-8",
  ],
  /** Confidential by default: a closed file with the seal still on it. */
  confidential: [
    "M10 16h28v24H10z",
    "M10 16l14 10 14-10",
    "M24 8v6",
    "M19 11h10",
  ],
};

/**
 * Bridge elevation, drawn as a section: deck, two piers, and the arch beneath.
 * Wider and shorter than the skyline so it suits a narrow band.
 *
 * 400x120 grid.
 */
export const bridgeSection = [
  // Deck, carried right across the band.
  "M0 62h1200",
  // Piers.
  "M300 62v46M900 62v46",
  "M282 108h36M882 108h36",
  // The arch springs from the pier bases and meets the deck at midspan.
  "M300 108C300 58 470 30 600 30s300 28 300 78",
  // Hangers between arch and deck.
  "M380 47v15M460 38v24M540 32v30M600 30v32M660 32v30M740 38v24M820 47v15",
  // Approach spans either side, so the deck does not just stop.
  "M0 70h300M900 70h300",
];
