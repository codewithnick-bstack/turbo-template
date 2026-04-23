"use client";

import { useState } from "react";

export function InviteForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      setStatus(res.ok ? "done" : "error");
      if (res.ok) { setEmail(""); setRole("editor"); }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-3 flex-wrap">
      <input
        type="email"
        placeholder="colleague@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 min-w-48 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      >
        <option value="admin">Admin</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium"
      >
        {status === "loading" ? "Sending…" : "Send Invite"}
      </button>
      {status === "done" && <span className="text-green-600 text-sm self-center">Invite sent!</span>}
      {status === "error" && <span className="text-red-600 text-sm self-center">Failed to send.</span>}
    </form>
  );
}
