import { ImageResponse } from "next/og";

import brand from "../../../brand.config";

/**
 * Browser-tab icon: the S knocked out of the brand navy.
 *
 * Replaces the initial-letter tile this drew before, which set the letter in
 * whatever sans-serif the OG renderer happened to have. That is the template
 * default and it looked like one — the letterform had nothing to do with the
 * site's own type.
 *
 * The S is drawn as a path rather than set as text for two reasons: the OG
 * image runtime has no access to the Archivo webfont without loading the file
 * itself, and a drawn letter can be built with counters open enough to survive
 * 16px, which a text glyph at that size cannot.
 *
 * The letter is a HOLE in the square (fill-rule evenodd), so the wrapper
 * behind it carries the light colour and the navy square is the ink. Painting
 * both navy hides the square and leaves a floating letter.
 *
 * This is deliberately NOT a logo mark — the brand is typographic and has none
 * by design. A favicon has a different job: it cannot show a wordmark at 16px,
 * so it shows the initial.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.primaryForeground ?? "#ffffff",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 40 40">
          <path
            d="M0 0h40v40H0zM7 8h26v7H16v4h17v13H7v-7h17v-4H7z"
            fill={brand.primaryColor}
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
