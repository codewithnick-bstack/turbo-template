"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InviteInfo = { email: string; role: string; tenantId: string; expiresAt: string };

export default function AcceptInviteClient({ token, invite }: { token: string; invite: InviteInfo }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/members/invite/accept", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, name: name || undefined }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to accept invite");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-8 max-w-sm w-full">
      <h1 className="text-xl font-bold mb-1">Accept invitation</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6">
        You&apos;ve been invited to join as <strong>{invite.role}</strong>.
        Accepting will give you access to the platform.
      </p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Email</label>
        <p className="text-sm">{invite.email}</p>
      </div>

      <div className="mb-6">
        <label htmlFor="name" className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
          Your name (optional)
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        onClick={accept}
        disabled={loading}
        className="w-full bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--primary-foreground)] text-sm font-semibold px-4 py-2.5 rounded-xl"
      >
        {loading ? "Accepting…" : "Accept invitation"}
      </button>
    </div>
  );
}
