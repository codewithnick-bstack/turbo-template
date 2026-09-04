"use client";

import { motion, useReducedMotion } from "framer-motion";

type WordmarkProps = {
  /** Sitting on a dark ground (the hero overlay, or the footer). */
  onDark?: boolean;
  className?: string;
  /** Animate the surname in on mount. Off in the footer, where nothing else
   *  animates on arrival and a moving logo would be the only thing twitching. */
  animate?: boolean;
};

/**
 * The wordmark: "S.R." in the surface colour, "Clarke" in the accent red.
 *
 * There is no logo mark by design — the brand is typographic. What makes it a
 * lockup rather than two words:
 *
 *   - A real word space between the initials and the surname, set as a flex
 *     gap. The two were previously separated by 2px of margin and read as
 *     "S.R.Clarke" at header size.
 *   - Positive letterspacing on "S.R." only. Display type this size closes up
 *     around the periods, and they need the room or they fill in.
 *   - The surname slides a few pixels into place on arrival, so the name
 *     assembles rather than appears. One movement, ~0.45s: enough to register
 *     as craft, short enough not to read as an intro animation. It animates
 *     position only, never opacity — a logo must never be invisible because
 *     an animation did not run.
 *
 * An underscore rule beneath the initials was tried and removed — under red
 * type it was more red than the lockup could carry, and it kept colliding with
 * the descender space at different scales.
 *
 * Colour note: over the hero the surface is always dark whatever the site
 * theme, so the accent pins #f76b60 (6.18:1 on navy-deep) rather than using
 * --accent-text, whose light value is #d8261c and measures only 3.6:1 there.
 */
export function Wordmark({ onDark = false, className = "", animate = true }: WordmarkProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = animate && !reduced;

  const initials = onDark ? "text-white" : "text-[var(--navy)] dark:text-white";
  const surname = onDark ? "text-[#f76b60]" : "text-[var(--accent-text)]";

  return (
    <span
      className={`font-display inline-flex items-baseline text-lg leading-none font-bold tracking-[-0.02em] ${className}`}
    >
      {/* The space is a real character inside the span, not a flex gap:
          a gap is visual only and leaves textContent as "S.R.Clarke". */}
      <span className={`${initials} tracking-[0.01em]`}>S.R.{"\u00A0"}</span>

      {shouldAnimate ? (
        <motion.span
          className={surname}
          // Only the offset animates. Fading up from opacity 0 meant the
          // company name was invisible until the animation ran, so a stalled
          // tab or a hydration failure removed the logo altogether.
          initial={{ x: -5 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          Clarke
        </motion.span>
      ) : (
        <span className={surname}>Clarke</span>
      )}
    </span>
  );
}
