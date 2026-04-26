"use client";

import type { Contact } from "@/lib/types";

function escapeCell(value: string | null | undefined): string {
  const s = value ?? "";
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function ExportCsvButton({ contacts }: { contacts: Contact[] }) {
  function download() {
    const headers = ["Name", "Email", "Phone", "Subject", "Message", "Status", "Date"];
    const rows = contacts.map((c) => [
      escapeCell(c.name),
      escapeCell(c.email),
      escapeCell(c.phone),
      escapeCell(c.subject),
      escapeCell(c.message),
      escapeCell(c.status),
      escapeCell(new Date(c.createdAt).toISOString()),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (contacts.length === 0) return null;

  return (
    <button
      onClick={download}
      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
    >
      Export CSV
    </button>
  );
}
