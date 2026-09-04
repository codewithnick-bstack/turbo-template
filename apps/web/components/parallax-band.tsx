"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Full-bleed band whose background image drifts slower than the page, so the
 * copy on top of it reads as a foreground layer.
 */
export function ParallaxBand({
  image,
  children,
  className = "",
}: {
  image: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      className={`on-dark relative isolate overflow-hidden bg-[var(--navy-deep)] ${className}`}
    >
      <motion.div
        aria-hidden="true"
        {...(reduced ? {} : { style: { y } })}
        className="absolute inset-x-0 -inset-y-[14%] -z-20 bg-cover bg-center opacity-70"
      >
        <div
          className="size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      </motion.div>
      {/* Copy sits on the left, so the scrim is heaviest there and lets the
          photo read on the right. Two layers of dimming (image opacity + a
          near-solid gradient) made the picture a smudge; one is enough. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[var(--navy-deep)] via-[var(--navy-deep)]/70 to-[var(--navy-deep)]/15"
        aria-hidden="true"
      />
      {children}
    </section>
  );
}
