import { ImageResponse } from "next/og";

import brand from "../../../brand.config";

/**
 * Browser-tab icon: the Span mark, reversed out on the brand navy.
 *
 * Replaces the initial-letter tile this used to draw. A letter on a rounded
 * square is what every template ships; the mark is the site's own.
 *
 * The geometry is duplicated from lib/logo-marks.ts rather than imported: this
 * runs in the OG image runtime, which renders a restricted subset of CSS and
 * cannot mount the React component. Keep the two in sync — there is a matching
 * note on the mark itself.
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
          background: brand.primaryColor,
        }}
      >
        {/* Same 40x40 grid as the component, scaled into the icon box. The
            deck is a filled bar and the piers are strokes, so the beam stays
            readable when the whole thing is 16px in a tab. */}
        <svg width="26" height="26" viewBox="0 0 40 40">
          <path d="M4 16h32v5H4z" fill={brand.primaryForeground ?? "#ffffff"} />
          <path
            d="M11 21v13M29 21v13M4 34h32"
            fill="none"
            stroke={brand.primaryForeground ?? "#ffffff"}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
