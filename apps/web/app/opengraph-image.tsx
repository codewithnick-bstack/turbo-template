import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site-data";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 55%, #0891b2 100%)",
          color: "white",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 860 }}>
            Premium client websites built for fast launches.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, opacity: 0.9 }}>{siteConfig.description}</div>
        </div>
      </div>
    ),
    size,
  );
}
