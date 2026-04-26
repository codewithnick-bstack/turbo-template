"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const mobileNavId = "mobile-nav";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight" aria-label={`${siteConfig.name} — home`}>
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
            {siteConfig.name.charAt(0).toUpperCase()}
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              onClick={() => trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { href: item.href, label: item.label, source: "desktop" })}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/search" aria-label="Search" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition">
            <Search size={16} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <Link href="/contact">
            <Button size="sm">Start a project</Button>
          </Link>
        </div>

        <button
          className="rounded-full border border-slate-200 p-2 md:hidden dark:border-slate-800"
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
        className={cn("border-t border-slate-200 md:hidden dark:border-slate-800", open ? "block" : "hidden")}
      >
        <nav aria-label="Mobile navigation">
          <div className="space-y-2 px-4 py-4">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setOpen(false);
                  trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICKED, { href: item.href, label: item.label, source: "mobile" });
                }}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <Search size={14} aria-hidden="true" />
              Search
            </Link>
            <div className="flex items-center justify-between gap-3 pt-2">
              <ThemeToggle />
              <Link href="/contact" onClick={() => setOpen(false)}>
                <Button size="sm">Get in touch</Button>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
