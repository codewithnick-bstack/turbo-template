"use client";

import { useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { projects } from "@/lib/site-data";

const allCategories = ["All", ...new Set(projects.map((project) => project.category))];

export function PortfolioShowcase() {
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);

  const filtered = useMemo(() => {
    if (category === "All") return projects;
    return projects.filter((project) => project.category === category);
  }, [category]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {allCategories.map((item) => (
          <button
            key={item}
            className={`rounded-full px-4 py-2 text-sm font-medium ${item === category ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((project, index) => (
          <Card key={project.slug} className="overflow-hidden p-0">
            <div className={`h-48 bg-gradient-to-br ${index % 2 === 0 ? "from-indigo-500/80 to-cyan-400/80" : "from-fuchsia-500/80 to-amber-400/80"}`} />
            <div className="p-6">
              <Badge>{project.category}</Badge>
              <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.summary}</p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300" onClick={() => setSelected(project)}>
                View details
                <ExternalLink className="size-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>{selected.category}</Badge>
                <h3 className="mt-3 text-2xl font-semibold">{selected.title}</h3>
              </div>
              <button aria-label="Close lightbox" onClick={() => setSelected(null)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{selected.summary}</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {selected.results.map((result) => (
                <li key={result}>• {result}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
