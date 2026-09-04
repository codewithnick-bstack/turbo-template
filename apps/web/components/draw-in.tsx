"use client";

import { motion, useReducedMotion } from "framer-motion";

type DrawInProps = {
  /** The `d` attribute of the path to draw. */
  d: string;
  className?: string;
  /** Stroke width in user units of the parent viewBox. */
  strokeWidth?: number;
  /** Order within a set of paths, multiplied by `stagger`. */
  index?: number;
  /** Seconds between each path's start. Lower it for drawings with many
   *  paths, or the last stroke begins long after the reader has moved on. */
  stagger?: number;
  /** Seconds the stroke takes to draw itself. */
  duration?: number;
};

/**
 * A single SVG path that draws itself when scrolled into view.
 *
 * This is the effect GSAP sells as DrawSVG, done with `pathLength`: framer
 * animates it from 0 to 1 and the browser handles the dash maths, so no
 * plugin and no second animation library is needed. `pathLength` normalises
 * the path to a 0-1 range regardless of its real length, which means one
 * duration reads the same on a short tick and a long skyline.
 *
 * Must be rendered inside an <svg>. Colour comes from the parent's
 * `stroke`/`currentColor`, so callers style it with the theme tokens rather
 * than passing a literal.
 */
export function DrawIn({
  d,
  className = "",
  strokeWidth = 1.5,
  index = 0,
  duration = 1.1,
  stagger = 0.12,
}: DrawInProps) {
  const reduced = useReducedMotion();

  // Reduced motion still gets the drawing — it is the artwork, not decoration.
  // It simply arrives complete instead of being animated in.
  if (reduced) {
    return (
      <path
        d={d}
        className={className}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }

  return (
    <motion.path
      d={d}
      className={className}
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        pathLength: { duration, delay: index * stagger, ease: [0.22, 1, 0.36, 1] },
        // Opacity resolves fast so the line does not look like it is fading
        // in; it should read as being drawn, not appearing.
        opacity: { duration: 0.2, delay: index * stagger },
      }}
    />
  );
}
