const API_URL = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT_ID = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

function mockHeaders(): Record<string, string> {
  return {
    "x-tenant-id": DEV_TENANT_ID,
    "x-user-id": "dev-user-id",
    "x-role": "owner",
    "content-type": "application/json",
  };
}

export type PlatformSite = {
  id: string;
  tenantId: string;
  slug: string;
  name: string;
  primaryDomain: string | null;
  status: string;
};

export type PlatformPage = {
  id: string;
  siteId: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  locale: string;
  content: { version: number; blocks: unknown[] };
  publishedAt: string | null;
};

export async function getSiteByHostname(hostname: string): Promise<PlatformSite | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/sites/by-hostname?hostname=${encodeURIComponent(hostname)}`,
      { headers: mockHeaders(), next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as PlatformSite;
  } catch {
    return null;
  }
}

export async function getPageBySlug(
  siteId: string,
  slug: string,
  locale = "en",
): Promise<PlatformPage | null> {
  try {
    const params = new URLSearchParams({ siteId, slug, locale });
    const res = await fetch(`${API_URL}/v1/pages/by-slug?${params}`, {
      headers: mockHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PlatformPage;
  } catch {
    return null;
  }
}

export async function listPagesForSite(siteId: string): Promise<PlatformPage[]> {
  try {
    const res = await fetch(`${API_URL}/v1/pages?siteId=${siteId}`, {
      headers: mockHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const { data } = await res.json();
    return (data as PlatformPage[]).filter((p) => p.status === "published");
  } catch {
    return [];
  }
}
