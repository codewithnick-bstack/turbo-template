"use client";

import { useState, useTransition } from "react";
import type { TTAuditEntry } from "@repo/sdk";

const RESOURCE_KINDS = ["", "site", "page", "blog_post", "form", "member", "media", "collection", "entry"];
const ACTION_COLORS: Record<string, string> = {
  created: "text-green-600 bg-green-50",
  updated: "text-[var(--primary)] bg-blue-50",
  deleted: "text-red-600 bg-red-50",
  published: "text-purple-600 bg-purple-50",
  unpublished: "text-amber-600 bg-amber-50",
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.includes(k));
  return key ? ACTION_COLORS[key] : "text-neutral-600 bg-neutral-100";
}

export function AuditLogClient({ initialEntries }: { initialEntries: TAuditEntry[] }) {
  const [entries, setEntries] = useState<TAuditEntry[]>(initialEntries);
  const [resourceKind, setResourceKind] = useState("");
  const [offset, setOffset] = useState(0);
  const [isPending, startTransition] = useTransition();
  const PAGE_SIZE = 50;

  async function load(kind: string, off: number) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
    if (kind) params.set("resourceKind", kind);
    const res = await fetch(`/api/audit?${params}`);
    const data = (await res.json()) as { data: TAuditEntry[] };
    setEntries(data.data ?? []);
  }

  function handleFilter(kind: string) {
    setResourceKind(kind);
    setOffset(0);
    startTransition(() => void load(kind, 0));
  }

  function handleNext() {
    const next = offset + PAGE_SIZE;
    setOffset(next);
    startTransition(() => void load(resourceKind, next));
  }

  function handlePrev() {
    const prev = Math.max(0, offset - PAGE_SIZE);
    setOffset(prev);
    startTransition(() => void load(resourceKind, prev));
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <select
          value={resourceKind}
          onChange={(e) => handleFilter(e.target.value)}
          className="text-sm border border-[var(--border)] rounded px-3 py-1.5 bg-transparent focus:outline-none"
        >
          {RESOURCE_KINDS.map((k) => (
            <option key={k} value={k}>{k || "All resources"}</option>
          ))}
        </select>
        {isPending && <span className="text-xs text-[var(--muted-foreground)]">Loading…</span>}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No audit events yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2 text-left">When</th>
                  <th className="px-4 py-2 text-left">Actor</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Resource</th>
                  <th className="px-4 py-2 text-left">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {entries.map((e) => (
                  <tr key={e.id} className="hover:bg-[var(--border)] transition-colors">
                    <td className="px-4 py-2 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-xs font-mono">
                      <span className="text-[var(--muted-foreground)]">{e.actorKind}/</span>
                      {e.actorId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${actionColor(e.action)}`}>
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs">{e.resourceKind}</td>
                    <td className="px-4 py-2 text-xs font-mono text-[var(--muted-foreground)]">
                      {e.resourceId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={handlePrev}
              disabled={offset === 0 || isPending}
              className="text-xs px-3 py-1.5 rounded border border-[var(--border)] disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={entries.length < PAGE_SIZE || isPending}
              className="text-xs px-3 py-1.5 rounded border border-[var(--border)] disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
