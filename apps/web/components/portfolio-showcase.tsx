"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PortfolioEntry } from "@/lib/types";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

type Props = { entries: PortfolioEntry[] };

export function PortfolioShowcase({ entries }: Props) {
  const allTags = useMemo(() => ["All", ...new Set(entries.flatMap((e) => e.tags))], [entries]);
  const [tag, setTag] = useState("All");
  const [selected, setSelected] = useState<PortfolioEntry | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openTriggerRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(() => {
    if (tag === "All") return entries;
    return entries.filter((e) => e.tags.includes(tag));
  }, [entries, tag]);

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
      const dialog = document.getElementById("portfolio-dialog");
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
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selected, close]);

  const modalTitleId = "portfolio-modal-title";

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {allTags.map((item) => (
          <button
            key={item}
            aria-pressed={item === tag}
            className={`rounded-full px-4 py-2 text-sm font-medium ${item === tag ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
            onClick={() => setTag(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((entry, index) => (
          <Card key={entry.id} className="overflow-hidden p-0">
            {entry.coverImageUrl ? (
              <div className="relative h-48 w-full">
                <Image
                  src={entry.coverImageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className={`h-48 bg-gradient-to-br ${index % 2 === 0 ? "from-indigo-500/80 to-cyan-400/80" : "from-fuchsia-500/80 to-amber-400/80"}`} />
            )}
            <div className="p-6">
              {entry.tags.length > 0 ? <Badge>{entry.tags[0]}</Badge> : null}
              <h3 className="mt-3 text-xl font-semibold">{entry.title}</h3>
              {entry.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{entry.description}</p>
              ) : null}
              <button
                ref={(el) => {
                  if (el && selected?.id === entry.id) openTriggerRef.current = el;
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300"
                onClick={(e) => {
                  openTriggerRef.current = e.currentTarget;
                  setSelected(entry);
                  trackEvent(ANALYTICS_EVENTS.PORTFOLIO_ITEM_CLICKED, { item_id: entry.id, item_title: entry.title });
                }}
                aria-haspopup="dialog"
              >
                View details
                <ExternalLink className="size-4" aria-hidden="true" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div id="portfolio-dialog" className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-950 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                {selected.tags[0] ? <Badge>{selected.tags[0]}</Badge> : null}
                <h3 id={modalTitleId} className="mt-3 text-2xl font-semibold">{selected.title}</h3>
                {selected.client ? <p className="mt-1 text-sm text-slate-500">{selected.client}</p> : null}
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
            {selected.description ? (
              <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.description}</p>
            ) : null}
            {selected.url ? (
              <a href={selected.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                Visit project <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
