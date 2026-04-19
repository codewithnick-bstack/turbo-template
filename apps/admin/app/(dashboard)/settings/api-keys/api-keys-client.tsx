"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
};

type NewKeyResult = ApiKey & { key?: string };

export function ApiKeysClient({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [newKey, setNewKey] = useState<NewKeyResult | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as NewKeyResult & { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to create key");
      setNewKey(data);
      setName("");
      setKeys((prev) => [{ ...data, key: undefined }, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
    if (newKey?.id === id) setNewKey(null);
  }

  function copyKey() {
    if (newKey?.key) {
      navigator.clipboard.writeText(newKey.key).catch(() => {});
    }
  }

  return (
    <div className="mt-6 space-y-8">
      {newKey?.key && (
        <div className="border border-green-300 bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            API key created — copy it now, it will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-sm bg-white border border-green-200 rounded px-3 py-2 break-all">
              {showKey ? newKey.key : "•".repeat(40)}
            </code>
            <button
              onClick={() => setShowKey((s) => !s)}
              className="p-2 rounded border border-green-200 hover:bg-white"
              title={showKey ? "Hide" : "Show"}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={copyKey}
              className="p-2 rounded border border-green-200 hover:bg-white"
              title="Copy"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-3">Create new key</h2>
        <form onSubmit={handleCreate} className="flex gap-2 max-w-md">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Key name (e.g. CI deploy, n8n agent)"
            className="flex-1 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {keys.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No API keys yet.</p>
      ) : (
        <div>
          <h2 className="text-sm font-semibold mb-3">Active keys</h2>
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between px-4 py-3 border border-[var(--border)] rounded-xl"
              >
                <div>
                  <p className="font-medium text-sm">{k.name}</p>
                  <p className="text-xs font-mono text-[var(--muted-foreground)]">
                    {k.prefix}…{" "}
                    {k.lastUsedAt
                      ? `last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                      : "never used"}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(k.id)}
                  className="text-red-400 hover:text-red-600 p-1"
                  title="Revoke key"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
