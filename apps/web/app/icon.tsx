import { ImageResponse } from "next/og";

import brand from "../../../brand.config";

/**
 * Browser-tab icon: the S mark knocked out of the brand navy.
 *
 * Replaces the initial-letter tile this used to draw in a system font. Same
 * letter, but drawn as the mark, so the tab matches the header.
 *
 * The squared treatment is used here rather than the free-standing letter the
 * header carries: a tab icon has to fill its box, and a floating glyph reads
 * as thin at 16px.
 *
 * The geometry is duplicated from lib/logo-marks.ts because this runs in the
 * OG image runtime, which cannot mount the React component — there is a note
 * on the mark saying to keep the two in step.
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
          // The square IS the navy ground: painting the wrapper navy too would
          // hide it and leave a floating white letter.
          background: brand.primaryForeground ?? "#ffffff",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 40 40">
          {/* Navy square with the letter knocked out of it. */}
          <path
            d="M0 0h40v40H0zM8 8h24v7H17v4h15v13H8v-7h15v-4H8z"
            fill={brand.primaryColor}
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
