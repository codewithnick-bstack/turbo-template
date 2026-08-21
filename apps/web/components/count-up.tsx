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
  const [display, setDisplay] = useState(reduced ? value : "");

  const match = value.match(/[\d.,]+/);
  const numeric = match ? Number(match[0].replace(/,/g, "")) : null;

  useEffect(() => {
    if (reduced || numeric === null || !inView) {
      if (reduced || numeric === null) setDisplay(value);
      return;
    }

    const decimals = match?.[0].includes(".") ? 1 : 0;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // easeOutExpo — fast start, long settle, reads as "counting up".
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = numeric * eased;
      const formatted =
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString("en-US");
      setDisplay(value.replace(/[\d.,]+/, formatted));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, inView, match, numeric, reduced, value]);

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
