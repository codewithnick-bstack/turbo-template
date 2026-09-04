"use client";

import { motion, useReducedMotion } from "framer-motion";

import { groupClarke, groupR, groupS } from "@/lib/wordmark-strokes";

/**
 * The wordmark drawn as strokes — the "signature" effect, done with framer's
 * pathLength rather than GSAP's DrawSVG so it needs no plugin.
 *
 * "S", "R" and "Clarke" draw IN PARALLEL: all three groups start together, so
 * the mark assembles in roughly the time one letter takes instead of crawling
 * through ten. Within a group the strokes still stagger, because that is what
 * makes each letter read as written rather than as parts appearing.
 *
 * This is a CANDIDATE, rendered only on the drawn-wordmark lab page. The
 * shipped logo is components/wordmark.tsx, which is real type.
 *
 * Why hand-drawn paths: a draw-on animation needs the centreline of each
 * letter, and fonts contain outlines. MorphSVGPlugin.convertToPath() converts
 * SVG <text> into a filled outline, which cannot be stroked open — so the
 * GSAP demo's technique does not solve this, and the letterforms are drawn by
 * coordinate.
 */
export function WordmarkDrawn({
  className = "",
  strokeWidth = 4.5,
  /** Seconds each stroke takes. */
  duration = 1.1,
  /** Seconds between strokes WITHIN a group. */
  stagger = 0.14,
}: {
  className?: string;
  strokeWidth?: number;
  duration?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();

  // The initials take the surface colour, the surname the accent — the same
  // split as the type wordmark.
  const groups = [
    { strokes: groupS, stroke: "currentColor" },
    { strokes: groupR, stroke: "currentColor" },
    { strokes: groupClarke, stroke: "var(--accent-text)" },
  ];

  return (
    <svg
      viewBox="0 0 231 64"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="S.R. Clarke"
    >
      {groups.map((group, groupIndex) =>
        group.strokes.map((glyph, index) => {
          const key = `${groupIndex}-${glyph.char}-${index}`;

          if (reduced) {
            return (
              <path
                key={key}
                d={glyph.d}
                stroke={group.stroke}
                strokeWidth={strokeWidth}
              />
            );
          }

          return (
            <motion.path
              key={key}
              d={glyph.d}
              stroke={group.stroke}
              strokeWidth={strokeWidth}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration,
                // Delay is per-group-position, NOT global: every group starts
                // at zero, so the three draw at once.
                delay: index * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        }),
      )}
    </svg>
  );
}
