"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { services } from "@/lib/site-data";

export function ServicesShowcase() {
  const [selected, setSelected] = useState<(typeof services)[number] | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openTriggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = "service-modal-title";

  const close = useCallback(() => {
    setSelected(null);
    openTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!selected) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = document.getElementById("service-dialog");
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, close]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.slug} className={`bg-gradient-to-br ${service.accent}`}>
            <div className="rounded-[1.4rem] bg-white/90 p-6 dark:bg-slate-950/85">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">From {formatCurrency(service.priceFrom)}</p>
              <h3 className="mt-3 text-xl font-semibold">{service.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {service.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-indigo-500" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant="secondary"
                aria-haspopup="dialog"
                onClick={(e) => {
                  openTriggerRef.current = e.currentTarget;
                  setSelected(service);
                }}
              >
                View package
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div id="service-dialog" className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-950 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">From {formatCurrency(selected.priceFrom)}</p>
                <h3 id={titleId} className="mt-2 text-2xl font-semibold">{selected.title}</h3>
              </div>
              <button
                ref={closeButtonRef}
                aria-label="Close dialog"
                onClick={close}
                className="rounded-full border border-slate-200 p-2 dark:border-slate-700"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.summary}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {selected.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 text-indigo-500" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Button className="flex-1" onClick={close}>Sounds good</Button>
              <Button className="flex-1" variant="outline" onClick={close}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
