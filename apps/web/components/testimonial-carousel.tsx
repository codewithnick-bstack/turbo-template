"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { Testimonial } from "@/lib/types";

type Props = { testimonials: Testimonial[] };

export function TestimonialCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    const t = testimonials[index];
    if (t) trackEvent(ANALYTICS_EVENTS.TESTIMONIAL_VIEWED, { author: t.authorName, index });
  }, [index, testimonials]);

  useEffect(() => {
    if (testimonials.length < 2 || paused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length, paused]);

  const active = testimonials[index] ?? testimonials[0];

  if (!active) return null;

  return (
    <Card className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {testimonials.length > 1 && (
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume auto-advance" : "Pause auto-advance"}
            className="rounded-full bg-[var(--muted-bg)] p-2 text-[var(--navy)] hover:bg-[var(--border)] dark:text-white dark:hover:bg-[var(--border)]"
          >
            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
          </button>
        )}
        <div className="rounded-full bg-[var(--muted-bg)] p-3 text-[var(--accent-text)]">
          <Quote className="size-5" aria-hidden="true" />
        </div>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <p className="max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl dark:text-slate-200">&ldquo;{active.quote}&rdquo;</p>
        <div className="mt-5">
          <p className="font-semibold text-slate-900 dark:text-white">{active.authorName}</p>
          {active.company ? <p className="text-sm text-slate-500 dark:text-slate-400">{active.company}</p> : null}
        </div>
      </div>
      {testimonials.length > 1 && (
        <div className="mt-6 flex gap-2" role="group" aria-label="Testimonial navigation">
          {testimonials.map((item, itemIndex) => (
            <button
              key={item.id}
              aria-label={`Show testimonial from ${item.authorName}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className="p-2 flex items-center justify-center"
              onClick={() => setIndex(itemIndex)}
            >
              <span className={`block h-2.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-[var(--accent)]" : "w-2.5 bg-[var(--border)]"}`} />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
