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
  // Arch bridge. Piers drop straight to a ground line and the arch springs
  // between them: splayed legs under a deck read as a picnic table.
  "heavy-construction": [
    "M4 18h40",
    "M14 18v14M34 18v14",
    "M14 32C14 24 18 20 24 20s10 4 10 12",
    "M6 40h36",
  ],
  // Mixed-use block: a taller and a lower mass with a shared plaza line.
  "real-estate-development": [
    "M5 42h38",
    "M9 42V16h13v26",
    "M26 42V25h13v17",
    "M13 22h5M13 30h5M30 31h5",
  ],
  // A roof truss: the assembly a specialist trade fabricates and sets, and the
  // only one of these four subjects that is unmistakably a sub-assembly rather
  // than a whole building. Three earlier attempts failed here — a trapezoid on
  // a stem read as a cocktail glass, a column-and-stiffener read as a stray
  // tick chart because nothing visibly touched, and an I-beam end-on
  // duplicated the company's own logo mark.
  "sub-contracting": [
    "M5 34h38",
    "M5 34 24 14l19 20",
    "M14 34l10-10 10 10",
    "M24 24v10",
  ],
};
