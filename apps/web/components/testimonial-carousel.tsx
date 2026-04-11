"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { testimonials } from "@/lib/site-data";

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const active = testimonials[index] ?? testimonials[0];

  if (!active) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
      <div className="absolute right-4 top-4 rounded-full bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-200">
        <Quote className="size-5" />
      </div>
      <p className="max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl dark:text-slate-200">“{active.quote}”</p>
      <div className="mt-5">
        <p className="font-semibold text-slate-900 dark:text-white">{active.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{active.company}</p>
      </div>
      <div className="mt-6 flex gap-2">
        {testimonials.map((item, itemIndex) => (
          <button
            key={item.name}
            aria-label={`Show testimonial ${itemIndex + 1}`}
            className={`h-2.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-indigo-600" : "w-2.5 bg-slate-300 dark:bg-slate-700"}`}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
    </Card>
  );
}
