"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The red accent rule that heads each section. Draws itself out from the left
 * when scrolled into view, so the eye lands on it before the heading.
 */
export function Rule({ className = "", light = false }: { className?: string; light?: boolean }) {
  const reduced = useReducedMotion();
  // `light` means "sitting on a dark ground". Both branches were #d8261c,
  // so the prop did nothing: the two call sites are on the image bands,
  // where the fill red is the wrong red. #f76b60 is the value --accent-text
  // carries in dark mode, and these bands are dark whatever the theme.
  const base = `h-1 origin-left ${light ? "bg-[#f76b60]" : "bg-[#d8261c]"} ${className}`;

  if (reduced) return <div aria-hidden="true" className={`${base} w-14`} />;

  return (
    <motion.div
      aria-hidden="true"
      className={`${base} w-14`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
