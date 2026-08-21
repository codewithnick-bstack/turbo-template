"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { hero } from "@/lib/site-data";
import { ANALYTICS_EVENTS, trackClarityEvent, trackEvent } from "@/lib/analytics";

const ROTATE_MS = 3800;
const hookWords = hero.hook.split(" ");
const FADE_S = 0.5;

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
      className="relative mx-auto mt-8 h-14 max-w-2xl text-lg font-light text-white/70 sm:h-9 sm:text-xl"
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
            // The outgoing line clears out before the next one arrives, so the
            // two never ghost over each other.
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
    <section className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#08172c]">
      <video
        ref={videoRef}
        className="absolute inset-0 -z-20 size-full object-cover opacity-[0.38]"
        poster="/hero/hero-poster.jpg"
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

      {/* Two scrims: a flat navy wash for contrast, then a vignette so the
          centre of the frame stays the brightest thing on screen. */}
      <div className="absolute inset-0 -z-10 bg-[#08172c]/40" aria-hidden="true" />
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(8,23,44,0.15)_25%,rgba(8,23,44,0.72)_95%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-3xl px-4 pt-24 pb-24 text-center sm:px-6">
        <h1 className="hero-rise-slow text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance text-white">
          {hookWords.length > 1 ? `${hookWords.slice(0, -1).join(" ")} ` : ""}
          <span className="relative inline-block whitespace-nowrap">
            {hookWords.at(-1)}
            {hero.trademark ? (
              <span
                aria-hidden="true"
                className="absolute top-[0.12em] -right-[0.85em] text-[0.2em] font-normal tracking-normal text-white/40"
              >
                TM
              </span>
            ) : null}
          </span>
        </h1>

        <RotatingLine />

        <div className="hero-rise mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            onClick={() => {
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                button: "primary",
                href: hero.primaryCta.href,
              });
              trackClarityEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED);
            }}
            className="group inline-flex items-center justify-center gap-2 bg-[#d8261c] px-10 py-4.5 text-base font-semibold tracking-wide text-white transition hover:bg-[#b81f16] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {hero.primaryCta.label}
            <ArrowRight
              className="size-4 transition group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href={hero.secondaryCta.href}
            onClick={() =>
              trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICKED, {
                button: "secondary",
                href: hero.secondaryCta.href,
              })
            }
            className="inline-flex items-center justify-center border border-white/30 px-10 py-4.5 text-base font-semibold tracking-wide text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* Scroll cue — the only other thing competing for attention. */}
      <motion.a
        href="#what-we-do"
        aria-label="Scroll to what we do"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 transition hover:text-white"
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="block h-12 w-px bg-gradient-to-b from-transparent via-white/40 to-white/70" />
      </motion.a>
    </section>
  );
}
