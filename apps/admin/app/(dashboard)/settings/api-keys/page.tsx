import { getApiClient } from "@/lib/api";
import { ApiKeysClient } from "./api-keys-client";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
};

export default async function ApiKeysPage() {
  const api = getApiClient();
  let keys: ApiKey[] = [];
  try {
    const res = (await api.apiKeys.list()) as { data: ApiKey[] };
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
