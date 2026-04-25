import { createBetterAuth } from "@repo/auth";
import { env } from "./env";
import type { Db } from "@repo/db";

let _auth: ReturnType<typeof createBetterAuth> | null = null;

export function initAuth(db: Db) {
  const opts = {
    db,
    secret: env.AUTH_SECRET,
    baseUrl: `${env.API_URL}/auth`,
    fromEmail: env.FROM_EMAIL,
    ...(env.RESEND_API_KEY ? { resendApiKey: env.RESEND_API_KEY } : {}),
  };
  _auth = createBetterAuth(opts);
  return _auth;
}

export function getAuth() {
  if (!_auth) throw new Error("Auth not initialized. Call initAuth() first.");
  return _auth;
}
