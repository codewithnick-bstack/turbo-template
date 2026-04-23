"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { GitBranch, Rocket, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Sandbox = {
  id: string;
  name: string;
  status: "active" | "promoting" | "promoted" | "deleted";
  promotedAt: string | null;
  createdAt: string;
};

export default function SandboxesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = use(params);
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function fetchSandboxes() {
    try {
      const res = await fetch(`/api/sandboxes?siteId=${siteId}`);
      const data = (await res.json()) as { data: Sandbox[] };
      setSandboxes(data.data ?? []);
    } catch {
      toast.error("Failed to load sandboxes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchSandboxes(); }, [siteId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createSandbox(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/sandboxes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, name: newName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create sandbox");
      toast.success("Sandbox created");
      setNewName("");
      setShowForm(false);
      await fetchSandboxes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function promoteSandbox(sandboxId: string) {
    try {
      const res = await fetch(`/api/sandboxes/${sandboxId}/promote`, { method: "POST" });
      if (!res.ok) throw new Error("Promote failed");
      toast.success("Sandbox promoted to production");
      await fetchSandboxes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  async function deleteSandbox(sandboxId: string) {
    try {
      const res = await fetch(`/api/sandboxes/${sandboxId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Sandbox deleted");
      setSandboxes((prev) => prev.filter((s) => s.id !== sandboxId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  const statusLabel: Record<Sandbox["status"], string> = {
    active: "Active",
    promoting: "Promoting…",
    promoted: "Promoted",
    deleted: "Deleted",
  };

  const statusColor: Record<Sandbox["status"], string> = {
    active: "bg-green-100 text-green-700",
    promoting: "bg-yellow-100 text-yellow-700",
    promoted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    deleted: "bg-red-100 text-red-600",
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/sites/${siteId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">Site</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch size={20} />
          Sandboxes
        </h1>
      </div>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        Create isolated copies of this site to test changes before pushing to production.
      </p>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--muted-foreground)]">{sandboxes.length} sandbox{sandboxes.length !== 1 ? "es" : ""}</p>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          <Plus size={14} />
          New sandbox
        </button>
      </div>

      {showForm && (
        <form onSubmit={createSandbox} className="mb-6 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="staging, preview-feature-x…"
            className="flex-1 border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
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
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <Loader2 size={14} className="animate-spin" />
          Loading…
        </div>
      ) : sandboxes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center">
          <GitBranch size={28} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium mb-1">No sandboxes yet</p>
          <p className="text-xs text-[var(--muted-foreground)]">Create a sandbox to safely test changes before they go live.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {sandboxes.map((sandbox) => (
            <div key={sandbox.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--muted-foreground)]" />
                  {sandbox.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Created {new Date(sandbox.createdAt).toLocaleDateString()}
                  {sandbox.promotedAt && ` · Promoted ${new Date(sandbox.promotedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[sandbox.status]}`}>
                  {statusLabel[sandbox.status]}
                </span>
                {sandbox.status === "active" && (
                  <>
                    <button
                      type="button"
                      onClick={() => void promoteSandbox(sandbox.id)}
                      className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                      title="Promote to production"
                    >
                      <Rocket size={12} />
                      Promote
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSandbox(sandbox.id)}
                      className="text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                      aria-label={`Delete sandbox ${sandbox.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
