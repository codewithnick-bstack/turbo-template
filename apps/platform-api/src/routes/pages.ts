import { Hono } from "hono";
import { Pages } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";
import { createPostgresSearchIndex } from "@repo/search";
import type { ServiceContext } from "@repo/core";
import type { TPage } from "@repo/schemas";

async function syncPageToSearch(ctx: ServiceContext, page: TPage) {
  try {
    const index = createPostgresSearchIndex(ctx.db);
    await index.upsert([{
      id: page.id,
      tenantId: ctx.tenantId,
      siteId: page.siteId,
      kind: "page",
      title: page.title ?? "",
      body: page.description ?? "",
      url: `/${page.slug}`,
    }]);
  } catch { /* non-fatal: search index update best-effort */ }
}

async function removePageFromSearch(ctx: ServiceContext, pageId: string) {
  try {
    const index = createPostgresSearchIndex(ctx.db);
    await index.delete([pageId]);
  } catch { /* non-fatal */ }
}

export const pagesRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/by-slug", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      const slug = c.req.query("slug");
      if (!siteId || !slug) {
        return c.json({ code: "bad_request", message: "siteId and slug query params required" }, 400);
      }
      const locale = c.req.query("locale") ?? "en";
      const page = await Pages.getPageBySlug(buildCtx(c), { siteId, slug, locale });
      if (!page) return c.json({ code: "not_found", message: `page not found: ${slug}` }, 404);
      return c.json(page);
    } catch (err) { return handleError(err, c); }
  })
  .get("/", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      if (!siteId) return c.json({ code: "bad_request", message: "siteId query param required" }, 400);
      const data = await Pages.listPages(buildCtx(c), { siteId });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const page = await Pages.createPage(buildCtx(c), body);
      return c.json(page, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id", async (c) => {
    try {
      const page = await Pages.getPage(buildCtx(c), c.req.param("id"));
      return c.json(page);
    } catch (err) { return handleError(err, c); }
  })
  .patch("/:id", async (c) => {
    try {
      const body = await c.req.json();
      const page = await Pages.updatePage(buildCtx(c), { ...body, id: c.req.param("id") });
      return c.json(page);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:id/publish", async (c) => {
    try {
      const ctx = buildCtx(c);
      const page = await Pages.publishPage(ctx, { id: c.req.param("id") });
      void syncPageToSearch(ctx, page);
      return c.json(page);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:id/unpublish", async (c) => {
    try {
      const ctx = buildCtx(c);
      const page = await Pages.unpublishPage(ctx, { id: c.req.param("id") });
      void removePageFromSearch(ctx, page.id);
      return c.json(page);
    } catch (err) { return handleError(err, c); }
  });
