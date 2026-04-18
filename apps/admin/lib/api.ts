import { PlatformClient } from "@repo/sdk";
import { env } from "./env";

export function getApiClient(tenantId?: string, userId?: string) {
  const tid = tenantId ?? env.DEV_TENANT_ID;
  const uid = userId ?? env.DEV_USER_ID;

  const mockFetch: typeof fetch = (input, init) =>
    fetch(input, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        "x-tenant-id": tid,
        "x-user-id": uid,
        "x-role": "owner",
      },
    });

  return new PlatformClient({ baseUrl: env.PLATFORM_API_URL, fetchImpl: mockFetch });
}
