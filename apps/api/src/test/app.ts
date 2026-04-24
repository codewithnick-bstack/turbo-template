import express, { json, urlencoded } from "express";
import type { Db } from "@repo/db";
import { errorHandler } from "../middleware/error-handler";
import { requestId } from "../middleware/request-id";
import { createBlogRouter } from "../routes/blog";
import { createTeamRouter } from "../routes/team";
import { createTestimonialsRouter } from "../routes/testimonials";
import { createPortfolioRouter } from "../routes/portfolio";
import { createContactsRouter } from "../routes/contacts";
import type { RequestHandler } from "express";

export function createTestApp(db: Db, authGuard: RequestHandler = (_req, _res, next) => next()) {
  const app = express();
  app.use(requestId);
  app.use(json());
  app.use(urlencoded({ extended: false }));

  app.get("/health", (_req, res) => { res.json({ status: "ok" }); });

  app.use("/api/v1/blog", createBlogRouter(db, authGuard));
  app.use("/api/v1/team", createTeamRouter(db, authGuard));
  app.use("/api/v1/testimonials", createTestimonialsRouter(db, authGuard));
  app.use("/api/v1/portfolio", createPortfolioRouter(db, authGuard));
  app.use("/api/v1/contacts", createContactsRouter(db, authGuard));

  app.use(errorHandler);
  return app;
}
