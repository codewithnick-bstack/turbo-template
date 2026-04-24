import { ImageResponse } from "next/og";
import brand from "../../../brand.config";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const letter = brand.businessName.charAt(0).toUpperCase();
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: brand.primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: brand.primaryForeground ?? "#ffffff",
          fontFamily: "sans-serif",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.5px",
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}
