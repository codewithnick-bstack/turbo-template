"use client";

import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger index — each step delays the reveal by 90ms. */
  index?: number;
  /** Distance to travel, in px. */
  y?: number;
};

/**
 * Scroll-triggered reveal. Fires once, when the element is ~20% into view.
 * Collapses to a plain div when the visitor asked for reduced motion.
 */
export function Reveal({ children, className, index = 0, y = 28 }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
