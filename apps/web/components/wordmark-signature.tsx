"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Wordmark } from "@/components/wordmark";
import { WordmarkDrawn } from "@/components/wordmark-drawn";

/**
 * The wordmark drawing itself, then quietly becoming the real thing.
 *
 * The drawn letterforms are hand-built centrelines — good enough to read as a
 * signature being written, but they are an approximation of Archivo and they
 * do not survive close inspection the way the type does. So the stroke version
 * only ever plays; the moment it finishes it cross-fades to the actual
 * Wordmark, and what the reader is left looking at is real type at the correct
 * weight and spacing.
 *
 * The swap is deliberately invisible: both sit in the same box, the outgoing
 * strokes fade over 0.45s while the type fades in over the same beat, so there
 * is no jump in position or weight to notice.
 *
 * Use this SPARINGLY — it is a 3.5-second animation. It belongs on a first
 * impression (a landing hero, a splash), not in persistent chrome that
 * re-mounts on every navigation.
 */
export function WordmarkSignature({
  className = "",
  /**
   * Height of the DRAWN layer. It is matched to the type's cap height rather
   * than set freely: the type sizes the box, and a taller SVG just overflows
   * it. Roughly 1.35x the type's line height lands the strokes on the same
   * baseline.
   */
  height = "h-[1.6rem]",
  onDark = false,
}: {
  className?: string;
  height?: string;
  onDark?: boolean;
}) {
  const reduced = useReducedMotion();

  // `playing` is the state that HIDES the type, and it starts false. That
  // ordering is deliberate: if the effect below never runs, or the timer never
  // fires, the type is on screen. The animation can only ever take something
  // away temporarily, never be the reason the logo is missing.
  const [playing, setPlaying] = useState(false);

  // Total = the last stroke's start + its own duration. Both come from
  // WordmarkDrawn's defaults; the fade begins as the final stroke lands.
  const DRAW_MS = 2600 + 5 * 280;
  const FADE_S = 0.45;

  useEffect(() => {
    if (reduced) return;
    setPlaying(true);
    const id = window.setTimeout(() => setPlaying(false), DRAW_MS);
    return () => window.clearTimeout(id);
  }, [DRAW_MS, reduced]);

  // Reduced motion skips the performance entirely and shows the type.
  if (reduced) {
    return (
      <span className={className}>
        <Wordmark onDark={onDark} animate={false} />
      </span>
    );
  }

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {/* The strokes, drawn on top of the type and removed once finished. */}
      <AnimatePresence>
        {playing ? (
          <motion.span
            className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_S, ease: "easeInOut" }}
          >
            <WordmarkDrawn
              className={`${height} w-auto ${onDark ? "text-white" : "text-[var(--navy)] dark:text-white"}`}
            />
          </motion.span>
        ) : null}
      </AnimatePresence>

      {/* The real type, underneath and ALWAYS fully opaque. It never animates:
          fading it up from zero would mean the logo is missing until a timer
          fires, and absent entirely if that timer never does. The strokes
          above simply uncover it. */}
      <span className={`flex items-center ${playing ? "invisible" : ""}`}>
        <Wordmark onDark={onDark} animate={false} />
      </span>
    </span>
  );
}
