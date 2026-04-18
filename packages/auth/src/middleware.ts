import { AppError } from "@repo/observability";
import { verifySession, type Session } from "./session";

export type AuthHeader = { authorization?: string; cookie?: string };

export async function authenticate(headers: AuthHeader, secret: string): Promise<Session> {
  const token = extractBearer(headers.authorization) ?? extractCookie(headers.cookie, "session");
  if (!token) throw new AppError("unauthorized", "missing session");
  const session = await verifySession(token, secret);
  if (!session) throw new AppError("unauthorized", "invalid session");
  return session;
}

function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function extractCookie(cookie: string | undefined, name: string): string | null {
  if (!cookie) return null;
  const match = cookie.split(";").map((c) => c.trim().split("=")).find(([k]) => k === name);
  return match?.[1] ?? null;
}
