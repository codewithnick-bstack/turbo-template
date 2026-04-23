"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

export function ComplianceActions() {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/compliance/export", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json() as { data: Record<string, unknown> };
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export ready", description: "Data archive downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not export data.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    const confirmed = confirm(
      "Schedule workspace deletion?\n\nAll data will be permanently purged after 30 days. This cannot be undone.",
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/compliance/tenant", { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: "Deletion scheduled",
        description: "Workspace will be purged in 30 days.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to schedule deletion.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--border)] transition-colors disabled:opacity-50"
      >
        {exporting ? "Exporting…" : "Export Data (JSON)"}
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      >
        {deleting ? "Scheduling…" : "Schedule Workspace Deletion"}
      </button>
    </div>
  );
}
