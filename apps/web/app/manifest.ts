import type { MetadataRoute } from "next";

import brand from "../../../brand.config";
import { siteConfig } from "@/lib/site-data";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: brand.businessName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: brand.primaryColor,
    icons: [
      // Add icon.png (192×192) and icon-512.png (512×512) to apps/web/app/
      // for Next.js to auto-generate /icon and /apple-icon routes.
      { src: "/opengraph-image", sizes: "1200x630", type: "image/png" },
    ],
  };
}
