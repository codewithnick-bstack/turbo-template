"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type CountUpProps = {
  /** Final display value, e.g. "275,374" or "4.7 yrs". Non-digits are preserved. */
  value: string;
  className?: string;
  durationMs?: number;
};

/**
 * Counts up to the numeric part of `value` when scrolled into view, keeping any
 * surrounding characters (commas, "yrs", "+") intact.
 */
export function CountUp({ value, className, durationMs = 1400 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  // Start on the real figure. The count is decoration; the number must be
  // correct even if the animation never runs.
  const [display, setDisplay] = useState(value);

  // `value.match()` returns a new array each render, so parsing it in the
  // component body and listing it as a dependency restarted the effect every
  // tick and reset the clock. It is parsed inside the effect instead.
  useEffect(() => {
    const match = value.match(/[\d.,]+/);
    const numeric = match ? Number(match[0].replace(/,/g, "")) : null;

    if (reduced || numeric === null || !inView) {
      setDisplay(value);
      return;
    }

    const decimals = match![0].includes(".") ? 1 : 0;
    const start = performance.now();
    let frame = 0;
    let settled = false;

    const land = () => {
      if (settled) return;
      settled = true;
      // The authored string, so the figure is exact rather than a rounding
      // of the eased value.
      setDisplay(value);
    };

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      if (progress >= 1) return land();
      // easeOutExpo — fast start, long settle, reads as "counting up".
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = numeric * eased;
      const formatted =
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString("en-US");
      setDisplay(value.replace(/[\d.,]+/, formatted));
      frame = requestAnimationFrame(tick);
    };

    // requestAnimationFrame is throttled to a standstill in a background or
    // occluded tab, which used to leave the figure frozen partway (275,374
    // stuck at 148,989). This timer is the backstop: whatever the frame loop
    // managed, the real number is shown once the duration has elapsed.
    const failsafe = window.setTimeout(land, durationMs + 100);

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, [durationMs, inView, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {/* Reserve the final width so the layout does not jitter while counting. */}
      <span aria-hidden="true" className="invisible block h-0 overflow-hidden">
        {value}
      </span>
      {display || " "}
    </span>
  );
}
