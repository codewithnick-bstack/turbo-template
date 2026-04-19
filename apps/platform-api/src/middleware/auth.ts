import type { Context, Next } from "hono";
import { isAppError } from "@repo/observability";
import { authenticate } from "@repo/auth";
import type { Session } from "@repo/auth";
import { env } from "../env";

export type AuthEnv = { Variables: { session: Session } };

export async function authMiddleware(c: Context<AuthEnv>, next: Next) {
  try {
    let session: Session;

    if (env.AUTH_PROVIDER === "mock" && process.env.NODE_ENV === "production") {
      return c.json({ code: "internal", message: "Mock auth provider not permitted in production" }, 500);
    }

    if (env.AUTH_PROVIDER === "mock") {
      const tenantId = c.req.header("x-tenant-id");
      const userId = c.req.header("x-user-id") ?? "mock-user";
      const role = (c.req.header("x-role") ?? "owner") as Session["role"];
      if (!tenantId) {
        return c.json({ code: "unauthorized", message: "x-tenant-id header required in mock mode" }, 401);
      }
      session = { userId, tenantId, role, expiresAt: Date.now() + 3600_000 };
    } else {
      session = await authenticate(
        { authorization: c.req.header("authorization"), cookie: c.req.header("cookie") },
        env.SESSION_SECRET,
      );
    }

    c.set("session", session);
    await next();
  } catch (err) {
    if (isAppError(err) && err.code === "unauthorized") {
      return c.json({ code: "unauthorized", message: err.message }, 401);
    }
    throw err;
  }
}
