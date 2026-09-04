/**
 * Line-art glyphs for the four industries, drawn on a 48x48 grid.
 *
 * These are deliberately structural rather than pictorial — elevations and
 * sections, the way the work actually gets drawn — so they sit with the
 * engineered tone of the display type instead of reading as generic UI icons.
 * Each is a list of paths so they can be drawn in sequence, foundation first,
 * which is also the order the real thing gets built in.
 *
 * Keyed by the industry slugs in site-data.ts. Stroke colour and width come
 * from the component that renders them.
 */
export const industryGlyphs: Record<string, string[]> = {
  // Curtain-walled tower: core, floor plates, and the glazing grid.
  "commercial-construction": [
    "M6 42h36",
    "M13 42V10h22v32",
    "M13 18h22M13 26h22M13 34h22",
    "M24 10v32",
  ],
  // Girder bridge: deck, two piers, and the truss diagonals beneath.
  "heavy-construction": [
    "M4 22h40",
    "M11 22v20M37 22v20",
    "M4 22l7-9h26l7 9",
    "M11 32l13-10 13 10",
  ],
  // Mixed-use block: a taller and a lower mass with a shared plaza line.
  "real-estate-development": [
    "M5 42h38",
    "M9 42V16h13v26",
    "M26 42V25h13v17",
    "M13 22h5M13 30h5M30 31h5",
  ],
  // Trade work: a steel connection — two members and the bolted plate.
  "sub-contracting": [
    "M8 14h32",
    "M24 14v20",
    "M14 34h20l-4 8H18z",
    "M18 22h12",
  ],
};
