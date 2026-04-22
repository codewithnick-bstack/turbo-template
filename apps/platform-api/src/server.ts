import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { isAppError } from "@repo/observability";
import { ZodError } from "zod";
import { env } from "./env";
import { healthRoute } from "./routes/health";
import { whoamiRoute } from "./routes/whoami";
import { sitesRoute } from "./routes/sites";
import { pagesRoute } from "./routes/pages";
import { formsRoute } from "./routes/forms";
import { webhooksRoute } from "./routes/webhooks";
import { billingRoute } from "./routes/billing";
import { collectionsRoute, entriesRoute } from "./routes/collections";
import { mediaRoute } from "./routes/media";
import { tenantsRoute } from "./routes/tenants";
import { searchRoute } from "./routes/search";
import { aiRoute } from "./routes/ai";
import { analyticsRoute } from "./routes/analytics";
import { blogRoute } from "./routes/blog";
import { membersRoute } from "./routes/members";
import { brandingRoute } from "./routes/branding";
import { templatesRoute } from "./routes/templates";
import { auditRoute } from "./routes/audit";
import { apiKeysRoute } from "./routes/api-keys";
import { agencyRoute } from "./routes/agency";

export function buildServer() {
  const app = new Hono();

  app.use("*", secureHeaders());
  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return origin ?? null;
        const allowed = new Set([env.WEB_ORIGIN, env.ADMIN_ORIGIN]);
        return allowed.has(origin) ? origin : null;
      },
      credentials: true,
    }),
  );
  app.use("*", honoLogger());

  app.route("/health", healthRoute);
  app.route("/v1/whoami", whoamiRoute);
  app.route("/v1/tenants", tenantsRoute);
  app.route("/v1/sites", sitesRoute);
  app.route("/v1/pages", pagesRoute);
  app.route("/v1/forms", formsRoute);
  app.route("/v1/webhooks", webhooksRoute);
  app.route("/v1/billing", billingRoute);
  app.route("/v1/collections", collectionsRoute);
  app.route("/v1/entries", entriesRoute);
  app.route("/v1/media", mediaRoute);
  app.route("/v1/search", searchRoute);
  app.route("/v1/ai", aiRoute);
  app.route("/v1/analytics", analyticsRoute);
  app.route("/v1/blog", blogRoute);
  app.route("/v1/members", membersRoute);
  app.route("/v1/branding", brandingRoute);
  app.route("/v1/templates", templatesRoute);
  app.route("/v1/audit", auditRoute);
  app.route("/v1/api-keys", apiKeysRoute);
  app.route("/v1/agency", agencyRoute);

  app.onError((err, c) => {
    if (isAppError(err)) {
      return c.json({ code: err.code, message: err.message, details: err.details }, err.status as 400 | 401 | 403 | 404 | 409 | 422 | 500);
    }
    if (err instanceof ZodError) {
      return c.json({ code: "bad_request", message: "Validation failed", details: err.flatten() }, 400);
    }
    console.error(err);
    return c.json({ code: "internal", message: "Internal server error" }, 500);
  });

  app.notFound((c) => c.json({ code: "not_found", message: "Route not found" }, 404));

  return app;
}
