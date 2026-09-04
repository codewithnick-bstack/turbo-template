"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Holds the hero's video layer back as the page scrolls, so the copy leaves
 * before the picture does, and fades the whole thing out by the time the
 * section is gone.
 *
 * The drift is small on purpose (12% of the section height). Large parallax on
 * a full-bleed video reads as the page coming apart, and it is expensive: only
 * transform and opacity are animated here, both of which the compositor can
 * handle without touching layout.
 */
export function HeroParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  if (reduced) {
    return (
      <div ref={ref} className="absolute inset-0 -z-20">
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="absolute inset-0 -z-20">
      {children}
    </motion.div>
  );
}
