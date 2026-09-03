"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { CtaLink } from "@/components/cta";
import { hero } from "@/lib/site-data";
import { ANALYTICS_EVENTS, trackClarityEvent, trackEvent } from "@/lib/analytics";

const ROTATE_MS = 4200;
const FADE_S = 0.5;
const hookWords = hero.hook.split(" ");

/**
 * Cycles the supporting line under the headline. Each line clears out before
 * the next arrives, so the two never ghost over each other. Holds on the first
 * line when reduced motion is requested.
 */
function RotatingLine() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || hero.rotating.length < 2) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % hero.rotating.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <p
      className="relative mt-8 h-16 max-w-2xl text-lg leading-relaxed font-light text-white/85 sm:h-10 sm:text-xl"
      aria-live="polite"
    >
      {hero.rotating.map((line, lineIndex) => {
        const active = lineIndex === index;
        return (
          <motion.span
            key={line}
            className="absolute inset-x-0 top-0"
            initial={false}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
            transition={{
              duration: reduced ? 0 : FADE_S,
              delay: reduced || !active ? 0 : FADE_S,
              ease: "easeOut",
            }}
            aria-hidden={!active}
          >
            {line}
          </motion.span>
        );
      })}
    </p>
  );
}

export function HeroSection() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Autoplay can be blocked (data saver, low power mode). The poster stays
  // visible in that case, so there is nothing to recover from.
  useEffect(() => {
    if (reduced) {
      videoRef.current?.pause();
      return;
    }
    videoRef.current?.play().catch(() => {});
  }, [reduced]);

  return (
    <section className="on-dark relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[var(--navy-deep)]">
      <video
        ref={videoRef}
        className="absolute inset-0 -z-20 size-full object-cover"
        poster="/hero/hero-poster.jpg"
        width={1600}
        height={900}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/hero/hero.mp4" type="video/mp4" />
      </video>

      {/* Scrim follows the copy: heaviest at the bottom-left where the type
          sits, lifting toward the top-right so the skyline stays visible.
          Measured against the brightest pixels this footage puts behind the
          text (lit windows and street lights, up to rgb(255,255,253)) — white
          needs 4.5:1, and a line of type is wider than any bright spot, so the
          FLOOR governs legibility rather than the average. At the 0.86 bottom
          stop white measures ~11.8:1 over the worst such pixel; 0.60 is the
          bare AA floor and a flat 0.55 fails at 4.05:1. Re-measure before
          lightening any stop. */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(8,23,44,0.86)_0%,rgba(8,23,44,0.72)_45%,rgba(8,23,44,0.34)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(8,23,44,0.62)_0%,rgba(8,23,44,0.22)_52%,transparent_80%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-6xl px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        {/* One h1 per page. Sized to dominate the fold — this industry's better
            sites lead with type at this weight, not with chrome. */}
        <h1 className="hero-rise-slow font-display max-w-5xl text-[clamp(2.75rem,8.5vw,6.5rem)] leading-[0.98] font-bold tracking-[-0.035em] text-white">
          {hookWords.length > 1 ? `${hookWords.slice(0, -1).join(" ")} ` : ""}
          {/* The mark stays in inline flow and rides the last word: absolute
              positioning put it wherever the line happened to break. */}
          <span className="whitespace-nowrap">
            {hookWords.at(-1)}
            {hero.trademark ? (
              <sup className="ml-[0.06em] align-super text-[0.2em] font-normal tracking-normal text-white/45">
                TM
              </sup>
            ) : null}
          </span>
        </h1>

        <div className="hero-rise-delay-1">
          <RotatingLine />
        </div>

        {/* Both doors, left-aligned under the subhead. The two-audience split
            is the business model, so neither CTA is demoted to a text link. */}
        <div className="hero-rise-delay-2 mt-12 flex flex-col gap-3 sm:flex-row">
          <CtaLink
            href={hero.primaryCta.href}
            label={hero.primaryCta.label}
            variant="primary"
            size="lg"
            withArrow
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                button: "primary",
                href: hero.primaryCta.href,
              });
              trackClarityEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED);
            }}
          />
          <CtaLink
            href={hero.secondaryCta.href}
            label={hero.secondaryCta.label}
            variant="outline"
            size="lg"
            onClick={() =>
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                button: "secondary",
                href: hero.secondaryCta.href,
              })
            }
          />
        </div>
      </div>

      {/* Scroll cue — the only other thing competing for attention. Desktop
          only; on a phone the fold ends where the thumb already is. */}
      <motion.a
        href="#what-we-do"
        aria-label="Scroll to what we do"
        className="absolute right-6 bottom-10 hidden text-white/40 transition-colors hover:text-white lg:right-10 lg:block"
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="block h-12 w-px bg-gradient-to-b from-transparent via-white/40 to-white/70" />
      </motion.a>
    </section>
  );
}
