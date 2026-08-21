"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * The header is fixed. Home opens with a full-bleed video hero that paints
 * under it on purpose; every other route needs the header height back.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main id="main-content" className={cn("flex-1", !isHome && "page-offset")}>
      {children}
    </main>
  );
}
