import "dotenv/config";
import express, { json, urlencoded } from "express";
import { env } from "./env";
import rateLimit from "express-rate-limit";
import { createDb } from "@repo/db";
import { initAuth } from "./auth";
import { corsMiddleware } from "./middleware/cors";
import { requestId } from "./middleware/request-id";
import { errorHandler } from "./middleware/error-handler";
import { createAuthGuard } from "./middleware/auth-guard";
import { toNodeHandler } from "better-auth/node";

import { createBlogRouter } from "./routes/blog";
import { createTeamRouter } from "./routes/team";
import { createTestimonialsRouter } from "./routes/testimonials";
import { createPortfolioRouter } from "./routes/portfolio";
import { createContactsRouter } from "./routes/contacts";
import { createSettingsRouter } from "./routes/settings";
import { createAiRouter } from "./routes/ai";
import { createMcpRouter } from "./mcp";

const { db } = createDb({ url: env.DATABASE_URL, ssl: env.DATABASE_URL.includes("sslmode=require") });
const auth = initAuth(db);
const authGuard = createAuthGuard(auth);

const app = express();

app.use(corsMiddleware);
app.use(requestId);
app.use(json({ limit: "1mb" }));
app.use(urlencoded({ limit: "1mb", extended: false }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Rate limit auth endpoints to prevent brute-force
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: "rate_limited", message: "Too many auth attempts, please try again later." },
});
app.all("/auth/*splat", authRateLimit, toNodeHandler(auth));

// Health check — no version exposed
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/v1/blog", createBlogRouter(db, authGuard));
app.use("/api/v1/team", createTeamRouter(db, authGuard));
app.use("/api/v1/testimonials", createTestimonialsRouter(db, authGuard));
app.use("/api/v1/portfolio", createPortfolioRouter(db, authGuard));
app.use("/api/v1/contacts", createContactsRouter(db, authGuard));
app.use("/api/v1/settings", createSettingsRouter(db, authGuard));
app.use("/api/v1/ai", createAiRouter(db, authGuard));

// MCP server
app.use("/mcp", createMcpRouter(db));

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[api] running on http://localhost:${env.PORT}`);
});
