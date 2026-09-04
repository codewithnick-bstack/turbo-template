"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/** Skew ceiling, in degrees. Past ~2deg the band reads as broken rather than
 *  heavy, and straight architectural lines make any tilt obvious. */
const MAX_SKEW_DEG = 1.5;

/**
 * Full-bleed band whose background image drifts slower than the page, so the
 * copy on top of it reads as a foreground layer.
 *
 * The image also skews a fraction of a degree with scroll velocity, which
 * gives the band a sense of weight when the page is thrown. It is applied to
 * the picture only — never to the copy, which has to stay readable — and
 * clamped hard, because the subject matter is full of straight lines that make
 * distortion conspicuous.
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

  // Velocity is spiky frame to frame, so it is smoothed before it reaches a
  // transform; the raw value would judder. The units here are scroll PROGRESS
  // per second (scrollYProgress runs 0-1 over the band), so +/-2 means the
  // band is being crossed twice a second — a hard flick, and the point where
  // the skew is clamped.
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });
  const skewY = useTransform(
    smoothVelocity,
    [-2, 0, 2],
    [`${MAX_SKEW_DEG}deg`, "0deg", `-${MAX_SKEW_DEG}deg`],
    { clamp: true },
  );

  return (
    <section
      ref={ref}
      className={`on-dark relative isolate overflow-hidden bg-[var(--navy-deep)] ${className}`}
    >
      <motion.div
        aria-hidden="true"
        {...(reduced ? {} : { style: { y, skewY } })}
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
