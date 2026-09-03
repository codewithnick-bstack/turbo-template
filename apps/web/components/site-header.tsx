"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { CtaLink } from "@/components/cta";
import { ThemeToggle } from "@/components/theme-toggle";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { hero, siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileNavId = "mobile-nav";

  // The home hero is a full-bleed video, so the header floats over it until
  // the user scrolls past the fold. Every other page gets the solid bar.
  const overlay = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    if (pathname !== "/") {
      setScrolled(true);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        overlay
          ? "border-b border-white/10 bg-transparent"
          : "border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Wordmark: "S.R." follows the surface (white over the hero, navy on
            the solid bar). "Clarke" carries the accent red, but the overlay
            state is always over the dark hero scrim regardless of site theme,
            so it needs its own red — --accent-text's LIGHT value (#d8261c)
            only measures 3.6:1 on navy-deep and fails there; #f4564a clears
            5.37:1 and is what the token already uses in dark mode. */}
        <Link
          href="/"
          className="font-display flex items-baseline text-lg leading-none font-bold tracking-[-0.02em]"
          aria-label={`${siteConfig.name} — home`}
        >
          <span className={overlay ? "text-white" : "text-[var(--navy)] dark:text-white"}>S.R.</span>
          <span className={cn("ml-1.5", overlay ? "text-[#f4564a]" : "text-[var(--accent-text)]")}>
            Clarke
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-[0.7rem] font-semibold tracking-[0.1em] uppercase transition-colors duration-[var(--duration-micro)]",
                overlay
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[var(--navy)] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
              )}
              onClick={() =>
                trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICKED, {
                  href: item.href,
                  label: item.label,
                  source: "desktop",
                })
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CtaLink
            href={hero.primaryCta.href}
            label={hero.primaryCta.label}
            variant="primary"
            className="px-5 py-2.5 text-[0.7rem] tracking-[0.1em] uppercase"
          />
          <CtaLink
            href={hero.secondaryCta.href}
            label={hero.secondaryCta.label}
            variant={overlay ? "outline" : "outlineDark"}
            className="px-5 py-2.5 text-[0.7rem] tracking-[0.1em] uppercase"
          />
        </div>

        <button
          className={cn(
            "rounded-sm border p-2 lg:hidden",
            overlay ? "border-white/30 text-white" : "border-slate-200 dark:border-slate-800",
          )}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls={mobileNavId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <div
        id={mobileNavId}
        className={cn(
          "border-t border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-950",
          open ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile navigation">
          <div className="space-y-1 px-4 py-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICKED, {
                    href: item.href,
                    label: item.label,
                    source: "mobile",
                  });
                }}
                className="block rounded-sm px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="grid gap-2 pt-3">
              <CtaLink
                href={hero.primaryCta.href}
                label={hero.primaryCta.label}
                variant="primary"
                onClick={() => setOpen(false)}
                className="justify-center py-3 text-sm"
              />
              <CtaLink
                href={hero.secondaryCta.href}
                label={hero.secondaryCta.label}
                variant="outlineDark"
                onClick={() => setOpen(false)}
                className="justify-center py-3 text-sm"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3">
              <ThemeToggle />
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <Search size={14} aria-hidden="true" />
                Search
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
