"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

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
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        overlay
          ? "border-b border-white/10 bg-transparent"
          : "border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2 tracking-tight"
          aria-label={`${siteConfig.name} — home`}
        >
          <span
            className={cn(
              "text-xl font-semibold",
              overlay ? "text-white" : "text-[#0e2a4f] dark:text-white",
            )}
          >
            S.R. <span className="text-[#d8261c]">Clarke</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-sm px-3 py-2 text-sm font-medium transition",
                overlay
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0e2a4f] dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
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
          <Link
            href={hero.primaryCta.href}
            className="rounded-sm bg-[#d8261c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b81f16]"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className={cn(
              "rounded-sm border px-5 py-2.5 text-sm font-semibold transition",
              overlay
                ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                : "border-[#0e2a4f]/25 text-[#0e2a4f] hover:bg-[#0e2a4f] hover:text-white dark:border-slate-700 dark:text-white dark:hover:bg-slate-800",
            )}
          >
            {hero.secondaryCta.label}
          </Link>
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
              <Link
                href={hero.primaryCta.href}
                onClick={() => setOpen(false)}
                className="rounded-sm bg-[#d8261c] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                onClick={() => setOpen(false)}
                className="rounded-sm border border-[#0e2a4f]/25 px-5 py-3 text-center text-sm font-semibold text-[#0e2a4f] dark:border-slate-700 dark:text-white"
              >
                {hero.secondaryCta.label}
              </Link>
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
