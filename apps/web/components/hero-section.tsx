"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { stats } from "@/lib/site-data";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

export function HeroSection() {
  const reduced = useReducedMotion();

  // No opacity in initial — hero text must be visible immediately for LCP.
  // Only animate the y-offset so the h1 is painted on first render.
  const fadeUp = reduced
    ? {}
    : { initial: { y: 18 }, animate: { y: 0 }, transition: { duration: 0.5, ease: "easeOut" as const } };

  const fadeScale = reduced
    ? {}
    : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 0.1 } };

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),transparent_24%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div {...fadeUp}>
          <Badge className="mb-4 gap-2">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Client-ready starter template
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Ship beautiful client websites in days, not weeks.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
            A premium monorepo starter with Next.js, Express, cron automation, Tailwind v4, and a polished marketing UI ready for fast swaps.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="w-full sm:w-auto"
              onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { button: "primary", href: "/contact" })}
            >
              <Button size="lg" className="w-full">
                Launch your next site
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link
              href="/portfolio"
              className="w-full sm:w-auto"
              onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, { button: "secondary", href: "/portfolio" })}
            >
              <Button variant="secondary" size="lg" className="w-full">Browse examples</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          {...fadeScale}
          className="rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70"
        >
          <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/5 p-4">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 p-[1px]">
              <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Why clients love it</p>
                <p className="mt-2">Fast page speed, premium design, and easy content swaps for each new launch.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
