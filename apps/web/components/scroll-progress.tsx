"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * Reading-progress rule pinned under the header. The page is long and the two
 * audience paths sit deep in it, so this is orientation rather than
 * decoration: it says how much is left.
 *
 * Hidden entirely under reduced motion — a bar that tracks the scrollbar is
 * redundant with the scrollbar itself, and it is the sort of constant movement
 * that request is asking to be rid of.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // Spring stops the bar juddering on trackpad momentum.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-[var(--header-height)] left-0 z-40 h-px w-full origin-left bg-[var(--accent)]"
    />
  );
}
