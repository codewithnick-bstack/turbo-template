import { env } from "./env";

export const clientApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// Server-side fetch: forwards session cookie from Next.js request headers
export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const res = await fetch(`${env.API_URL}/api/v1${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.headers ?? {}),
      cookie: cookieStore.toString(),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Server-side auth endpoint (no /api/v1 prefix — better-auth mounts at /auth)
export async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const res = await fetch(`${env.API_URL}/auth${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.headers ?? {}),
      cookie: cookieStore.toString(),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Auth error ${res.status}`);
  }
  return res.json() as Promise<T>;
}
