import type { Context } from "hono";
import { isAppError } from "@repo/observability";
import { ZodError } from "zod";

export function handleError(err: unknown, c: Context) {
  if (isAppError(err)) {
    return c.json({ code: err.code, message: err.message, details: err.details }, err.status as 400 | 401 | 403 | 404 | 409 | 422 | 500);
  }
  if (err instanceof ZodError) {
    return c.json({ code: "bad_request", message: "Validation failed", details: err.flatten() }, 400);
  }
  console.error(err);
  return c.json({ code: "internal", message: "Internal server error" }, 500);
}
