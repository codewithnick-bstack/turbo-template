import { getApiClient } from "@/lib/api";
import { ApiKeysClient } from "./api-keys-client";

export default async function ApiKeysPage() {
  const api = getApiClient();
  let keys: Awaited<ReturnType<typeof api.apiKeys.list>>["data"] = [];
  try {
    const res = await api.apiKeys.list();
    keys = res.data ?? [];
  } catch {
    // API unavailable during build
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">API Keys</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Create API keys for programmatic access and AI agents.
      </p>
      <ApiKeysClient initialKeys={keys} />
    </div>
  );
}
