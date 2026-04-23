"use client";

import { useState } from "react";
import { Plus, Loader2, FlaskConical, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { TExperiment, TExperimentResult, TExperimentVariant } from "@repo/sdk";

type ExperimentWithResults = TExperiment & { results?: TExperimentResult[] };

export function ExperimentsTab({ siteId, initial }: { siteId: string; initial: TExperiment[] }) {
  const [experiments, setExperiments] = useState<ExperimentWithResults[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingResults, setLoadingResults] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [goal, setGoal] = useState<"form_submit" | "pageview" | "click">("form_submit");
  const [variants, setVariants] = useState<{ id: string; name: string; weight: number }[]>([
    { id: "control", name: "Control", weight: 50 },
    { id: "variant-a", name: "Variant A", weight: 50 },
  ]);

  function updateVariant(idx: number, field: keyof TExperimentVariant, value: string | number) {
    setVariants((vs) => vs.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  }

  function addVariant() {
    const remaining = 100 - variants.reduce((s, v) => s + v.weight, 0);
    setVariants((vs) => [...vs, { id: `variant-${vs.length}`, name: `Variant ${vs.length}`, weight: Math.max(0, remaining) }]);
  }

  const weightSum = variants.reduce((s, v) => s + v.weight, 0);

  async function createExperiment(e: React.FormEvent) {
    e.preventDefault();
    if (weightSum !== 100) {
      toast.error("Variant weights must sum to 100");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, name, variants, goalEvent: goal }),
      });
      if (!res.ok) throw new Error("Failed to create experiment");
      const data = await res.json() as TExperiment;
      setExperiments((prev) => [data, ...prev]);
      setShowForm(false);
      setName("");
      toast.success("Experiment created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function loadResults(id: string) {
    if (loadingResults === id) return;
    setLoadingResults(id);
    try {
      const res = await fetch(`/api/experiments/${id}/results`);
      const data = await res.json() as { results: TExperimentResult[] };
      setExperiments((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, results: data.results } : exp)),
      );
      setExpandedId(id);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoadingResults(null);
    }
  }

  const statusColor: Record<TExperiment["status"], string> = {
    draft: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    running: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    concluded: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical size={18} />
          A/B Experiments
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-[var(--primary)] px-3 py-1.5 text-xs text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus size={12} />
          New experiment
        </button>
      </div>

      {showForm && (
        <form onSubmit={createExperiment} className="mb-6 rounded-xl border border-[var(--border)] p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Name</label>
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Homepage CTA test"
              className="w-full border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Goal event</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as typeof goal)}
              className="border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="form_submit">Form submit</option>
              <option value="pageview">Pageview</option>
              <option value="click">Click</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">Variants (weights must sum to 100)</label>
              <span className={`text-xs ${weightSum === 100 ? "text-green-600" : "text-red-500"}`}>
                {weightSum}/100
              </span>
            </div>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    placeholder="Variant name"
                    className="flex-1 border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={v.weight}
                    onChange={(e) => updateVariant(i, "weight", Number(e.target.value))}
                    className="w-16 border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="text-xs text-[var(--muted-foreground)]">%</span>
                </div>
              ))}
            </div>
            {variants.length < 8 && (
              <button
                type="button"
                onClick={addVariant}
                className="mt-2 text-xs text-[var(--primary)] hover:underline"
              >
                + Add variant
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || weightSum !== 100}
              className="flex items-center gap-1.5 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
            >
              {creating && <Loader2 size={12} className="animate-spin" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--muted)]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {experiments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center">
          <FlaskConical size={24} className="mx-auto mb-2 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium">No experiments yet</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Create an A/B experiment to compare variants and measure conversions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {experiments.map((exp) => (
            <div key={exp.id}>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{exp.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {(exp.variants as TExperimentVariant[]).length} variants · goal: {exp.goalEvent}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[exp.status]}`}>
                    {exp.status}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      expandedId === exp.id ? setExpandedId(null) : loadResults(exp.id)
                    }
                    className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                    disabled={loadingResults === exp.id}
                  >
                    {loadingResults === exp.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <TrendingUp size={12} />
                    )}
                    Results
                  </button>
                </div>
              </div>

              {expandedId === exp.id && exp.results && (
                <div className="px-4 pb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                        <th className="pb-2 pr-4">Variant</th>
                        <th className="pb-2 pr-4 text-right">Impressions</th>
                        <th className="pb-2 pr-4 text-right">Conversions</th>
                        <th className="pb-2 text-right">Conv. rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exp.results.map((r) => (
                        <tr key={r.variantId} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-4 font-medium">{r.variantName}</td>
                          <td className="py-2 pr-4 text-right">{r.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4 text-right">{r.conversions.toLocaleString()}</td>
                          <td className="py-2 text-right">
                            {(r.conversionRate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
