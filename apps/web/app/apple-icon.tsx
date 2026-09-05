import { ImageResponse } from "next/og";

import brand from "../../../brand.config";

/**
 * iOS home-screen icon. There was none before, so adding the site to a home
 * screen produced a blurry screenshot of the page.
 *
 * Two differences from the 32px favicon, both because iOS treats this icon
 * differently: it is 180x180 (the size Apple asks for), and the letter is
 * inset rather than bleeding to the edge, because iOS applies its own rounded
 * mask and a full-bleed mark loses its corners to it.
 *
 * Same geometry as app/icon.tsx — keep the two in step.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brand.primaryColor,
        }}
      >
        {/* Inset so iOS's rounded mask cannot clip the letterform. */}
        <svg width="116" height="116" viewBox="0 0 40 40">
          <path
            d="M8 8h24v7H17v4h15v13H8v-7h15v-4H8z"
            fill={brand.primaryForeground ?? "#ffffff"}
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
