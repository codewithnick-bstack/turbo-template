"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

type DriftProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Vertical travel across the whole scroll of the element, in px. Negative
   * moves against the scroll (rises), positive moves with it (lags).
   */
  distance?: number;
};

/**
 * Moves its child a few pixels against the page as it scrolls past, so
 * adjacent columns separate slightly instead of travelling as one slab.
 *
 * Deliberately tiny. Two columns drifting 20px apart reads as depth; the same
 * effect at 100px reads as a broken layout. Pair opposite signs on
 * side-by-side items and leave the copy that has to be read alone.
 */
export function Drift({ children, className, distance = -24 }: DriftProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-distance}px`, `${distance}px`]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
