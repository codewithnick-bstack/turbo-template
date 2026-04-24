---
title: "feat: Template Completion Roadmap — Phase 2"
type: feat
status: active
date: 2026-04-24
---

# Template Completion Roadmap — Phase 2

## Overview

The vision reset (Phase 1, completed 2026-04-23) rebuilt the template from a multi-tenant SaaS platform into an AI-first single-business website template. The core shape is done: 10 public pages, admin CMS, Express API, MCP server, auth, chatbot, SEO, dark mode, CI.

This roadmap defines the remaining work to make the template genuinely production-ready — fixing things that break the core promise, hardening deployment, wiring up observability, and adding the content features that unlock real editorial workflows.

Work is organized into four phases ordered by impact and dependency.

## Problem Frame

Several gaps currently undermine the template's stated promise:

1. **Blog content renders as raw Markdown text** — `gray-matter` and `next-mdx-remote` are installed but never imported. A deployer who publishes a blog post sees literal `#` and ` ``` ` characters on the live site.
2. **No path to create the first admin user** — The seed script creates content data but not a user row. A fresh deployer cannot log in without direct DB access.
3. **Publish-to-live lag** — The ISR revalidation webhook exists in `apps/web` but the API never calls it after content mutations. The live site is stale until ISR TTL expires.
4. **Dead features ship in the box** — Admin search has full UI and ARIA patterns but the backend route (`/api/search`) doesn't exist. `ai.txt` is in the requirements but never built. `scripts/verify-parity.ts` and `scripts/generate-openapi.ts` both crash because they target deleted packages.
5. **No deployment configs** — The README says "deploy to Vercel / Railway" but provides no `vercel.json`, `railway.json`, or API Dockerfile. A first-time deployer guesses.
6. **Unstructured production logs** — `apps/api` uses `console.log`/`console.error` throughout despite `pino` with redaction being fully implemented in `@repo/observability`. Production deployments leak potentially sensitive data in logs.
7. **Near-zero test coverage** — One test file exists (4 unit tests in `@repo/observability`). No route tests, no component tests, no auth flow tests.

## Requirements Trace

- R1. Visitor reads a blog post with rendered Markdown headings, code blocks, and lists — not raw text
- R2. Fresh-clone deployer can create their first admin account without direct DB access
- R3. Publishing a blog post in admin triggers ISR revalidation; live site updates within 5 seconds
- R4. `ai.txt` route exists and lists template's MCP endpoint + allowed agent operations
- R5. Admin search returns results for blog, team, portfolio, and contact queries
- R6. `make deploy` or equivalent deploys api + web + admin to Railway + Vercel with documented env vars
- R7. API logs are structured JSON via pino with sensitive field redaction active in production
- R8. API route tests cover at minimum: blog CRUD, auth guard, contact submission, rate limiting
- R9. Status page reflects actual template services (web, admin, api, db) not the old SaaS platform list
- R10. Stale deps (`gray-matter`, `next-mdx-remote` if not used), broken scripts, and stale ADR/changeset configs are cleaned up

## Scope Boundaries

- No multi-tenancy — this remains a single-business template
- No image upload / media management in this phase — URL strings continue; R2 upload is Phase 3+
- No magic link / password reset UI in this phase — email+password + manual seed is sufficient
- No pgvector / semantic search — tsvector chatbot remains
- No Storybook publishing or docs site — internal development use only
- No OpenFeature / BullMQ wiring — ADR-0007 and ADR-0008 are future phases; ADRs should be updated to reflect deferred status

### Deferred to Separate Tasks

- Image upload and media management (S3/R2 integration): future Phase 3 plan
- Magic link login UI and forgot-password flow: future Phase 3 plan
- pgvector semantic search upgrade: future Phase 4 plan
- Docs site / Nextra: future Phase 5 plan
- OpenAPI SDK generation: future Phase 3 plan (requires fixing generate-openapi script first, tracked in Unit 1.5)

## Context & Research

### Relevant Code and Patterns

- `apps/web/app/blog/[slug]/page.tsx` — blog post renderer; currently `whitespace-pre-wrap` only
- `apps/web/package.json` — `gray-matter@^4.0` and `next-mdx-remote@^5.0` installed, never imported
- `apps/api/src/routes/blog.ts` — publish/unpublish mutations that should trigger revalidation
- `apps/api/src/routes/team.ts`, `testimonials.ts`, `portfolio.ts`, `settings.ts` — content mutations needing revalidation hook
- `apps/web/app/api/revalidate/route.ts` — ISR webhook handler (exists, has `REVALIDATE_SECRET` check)
- `apps/admin/app/(dashboard)/search-bar.tsx` — combobox UI calling `/api/search?q=`; backend missing
- `apps/web/app/llms.txt/route.ts` — `ai.txt` sibling that was never created
- `apps/api/src/index.ts` — Express entry; `console.log`/`console.error` throughout
- `packages/observability/src/logger.ts` — fully implemented pino logger with redaction; never called from API
- `packages/db/src/seed.ts` — seeds content data but not the `user` / `account` tables that better-auth creates
- `scripts/verify-parity.ts` — imports from `packages/core/src` (deleted); crashes on run
- `scripts/generate-openapi.ts` — imports from `packages/core/src` (deleted); crashes on run
- `.changeset/config.json` — `ignore` array lists `cron`, `platform-api`, `worker`, `mcp`, `docs-site` (all deleted); repo URL is placeholder
- `apps/web/app/status/page.tsx` — fully hardcoded with fabricated latency and old SaaS service names
- `docs/adr/0006-auth-provider-adapter.md` — describes WorkOS/Clerk selection; current auth is `better-auth`
- `docs/adr/0007-worker-bullmq.md` — describes BullMQ; no queue system exists
- `docs/adr/0008-feature-flags.md` — describes OpenFeature; no feature flags exist

### Institutional Learnings

- (No `docs/solutions/` entries yet — solutions directory exists but is empty)

### External References

- `next-mdx-remote` v5 docs: serialize on server, render with `<MDXRemote>` on client or server
- Railway deploy docs: `railway.json` with `startCommand` and `healthcheckPath`
- Vercel monorepo docs: `vercel.json` with `buildCommand`, `outputDirectory`, `installCommand` pointing to workspace root
- better-auth docs: `createUser` admin utility for seeding the first user row

## Key Technical Decisions

- **Markdown renderer: `next-mdx-remote` (already installed) over `react-markdown`** — deps already present; `next-mdx-remote` handles RSC serialization correctly and the seed content already uses MDX-compatible Markdown. Using it avoids a new dep.
- **First-user creation: extend `db:seed` script** — Add a conditional user+account insert to the existing seed script behind a `CREATE_ADMIN=true` env flag. Simpler than a separate CLI command or admin setup wizard. On production, document running `pnpm db:seed` once after first migration.
- **ISR revalidation: call webhook from API service layer, not router** — Service functions (`publishPost`, `upsertSettings`, etc.) should call the revalidation webhook as a fire-and-forget side effect. This keeps routers clean and makes revalidation testable at the service layer.
- **Admin search: Next.js API route in `apps/admin`** — The search bar calls `/api/search?q=` which is a Next.js internal route (not the Express API). Implementation: a Next.js Route Handler that uses `authFetch` to query the Express API (blog + team + portfolio search endpoints) and merges results. Avoids exposing a new unauthenticated Express endpoint.
- **Pino logging: replace console.\* calls in `apps/api`** — `createLogger` from `@repo/observability` is already implemented with redaction rules. Simple drop-in; pass logger instance through the Express app or use a module-level singleton pattern matching existing `aiServiceSingleton` pattern.
- **`ai.txt`: static-ish Route Handler** — Mirror the `llms.txt` pattern: a `GET /ai.txt` route in `apps/web/app/ai.txt/route.ts` that returns a plain text permissions manifest referencing the MCP endpoint URL.
- **Deployment configs: minimal `vercel.json` + `railway.json`** — One `vercel.json` per Next.js app declaring root directory. One `railway.json` for API with start command + healthcheck path. No complex monorepo build graphs needed.
- **Broken scripts: remove, don't fix** — `verify-parity.ts` and `generate-openapi.ts` both target deleted packages. The parity invariant (ADR-0005) no longer applies in the same form. Remove the scripts and remove their npm run entries rather than rewriting them for a codebase they no longer match.
- **Status page: replace hardcoded data with real template services** — Keep the page static (no real health polling needed in a template) but update service names to match actual deployed services: Web, Admin, API, Database. Remove fabricated uptime history and old SaaS service names.
- **Stale ADR updates: mark superseded, don't delete** — ADR-0006 (WorkOS/Clerk), ADR-0007 (BullMQ), ADR-0008 (OpenFeature) describe directions not taken in the vision reset. Add `status: superseded` frontmatter and a brief note explaining the current state. Preserves history without confusing future readers.

## Open Questions

### Resolved During Planning

- **Should `next-mdx-remote` serialize on server or client?** Server. Next.js 15 App Router supports RSC serialization in `next-mdx-remote/rsc`. No client boundary needed for basic Markdown rendering.
- **Should the ISR webhook be called for all content mutations or only publish actions?** All mutations that change publicly visible content (create, update, delete, publish, unpublish, feature toggle) should trigger revalidation for the affected path(s) plus `/` (homepage may embed latest blog). Settings mutations should revalidate all paths.
- **Should admin search hit the Express API or query the DB directly from the Next.js server?** Via Express API. The architecture constraint (Next.js apps are standalone UI consumers, no direct DB access) must be preserved. Express search endpoint returns merged results.

### Deferred to Implementation

- **Exact pino transport config for Railway/Render log ingestion** — log format (JSON vs. pretty) depends on the target host. The logger already has `NODE_ENV`-aware pretty-printing in dev; production JSON is the right default. Platform-specific log drain setup is documented in the deployment README, not in code.
- **Whether `next-mdx-remote` v5 RSC serialize path has quirks with Tailwind `prose`** — Minor rendering issues (table styles, code block theming) may surface at implementation time. The approach is correct; exact className adjustments are implementation-time discoveries.
- **Whether better-auth's `createUser` utility works without an active HTTP context** — The seed script runs outside an HTTP request. `better-auth` has a Node.js admin utility for this; exact API surface to verify at implementation time.

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification._

### ISR Revalidation Flow

```
Admin UI
  → PUT /api/v1/blog/:id/publish
      → apps/api: publishPost(db, id)
          → UPDATE blog SET status='published'
          → revalidateWebPaths(['/blog', '/blog/:slug', '/'])   ← new side-effect
              → POST apps/web/api/revalidate
                  (fire-and-forget, errors logged not thrown)
  ← 200 OK returned immediately
```

### Admin Search Architecture

```
Admin SearchBar (combobox)
  → GET /api/search?q=term
      → apps/admin/app/api/search/route.ts  (new Next.js Route Handler)
          → parallel authFetch to Express:
              GET /api/v1/blog?search=term
              GET /api/v1/team?search=term
              GET /api/v1/portfolio?search=term
          → merge + rank results by kind
          ← [{id, kind, title, url}, ...]
  ← render in listbox
```

## Implementation Units

### Phase 1 — Ship Blockers

- [ ] **Unit 1.1: Markdown rendering for blog posts**

**Goal:** Blog post content stored as Markdown renders correctly on the public site (headings, lists, code blocks, bold/italic).

**Requirements:** R1

**Dependencies:** None

**Files:**

- Modify: `apps/web/app/blog/[slug]/page.tsx`
- Modify: `apps/web/app/blog/[slug]/mdx-content.tsx` _(create if needed as RSC wrapper)_
- Test: `apps/web/app/blog/[slug]/mdx-content.test.tsx`

**Approach:**

- Use `next-mdx-remote/rsc` `compileMDX` to serialize post content on the server
- Replace `whitespace-pre-wrap` prose div with `<MDXRemote source={post.content} />`
- Ensure Tailwind `prose` classes apply to the rendered output
- Handle edge case: empty content, content that is not valid Markdown (plain text still renders correctly)
- Do not remove `gray-matter` dep — it may be needed for future frontmatter in content; leave installed

**Patterns to follow:**

- `next-mdx-remote` v5 RSC pattern from its own README
- Existing `prose prose-slate mt-10 max-w-none dark:prose-invert` classes in the current blog post page

**Test scenarios:**

- Happy path: post with `# Heading`, `**bold**`, `` `code` ``, and a fenced code block renders all as HTML elements
- Edge case: post with `content: ""` renders empty without crashing
- Edge case: post with plain text (no Markdown syntax) renders as a paragraph
- Edge case: post content with an HTML injection attempt (`<script>`) is sanitized by `next-mdx-remote`'s default escaping

**Verification:**

- Navigate to any published blog post; heading text appears styled as `<h1>`, not prefixed with `#`
- Code blocks render with monospace font and background highlight
- Dark mode prose styles apply correctly

---

- [ ] **Unit 1.2: First admin user creation path**

**Goal:** A fresh deployer can create the initial admin account by running a documented command — no direct DB access required.

**Requirements:** R2

**Dependencies:** None

**Files:**

- Modify: `packages/db/src/seed.ts`
- Modify: `Makefile` _(add `create-admin` target)_
- Modify: `README.md` _(document first-login setup step)_

**Approach:**

- Add `createAdminUser(email, password)` function to `packages/db/src/seed.ts` that:
  - Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env vars
  - Uses `better-auth`'s Node.js admin utility (`createUser`) to insert user + hashed password
  - Skips silently if a user with that email already exists (idempotent)
- Gate behind `CREATE_ADMIN=true` env flag OR extract to a separate `scripts/create-admin.ts` script
- Add `create-admin` Makefile target: `node -r dotenv/config scripts/create-admin.ts`
- Document in README: step 3.5 between "migrate" and "seed" — run `make create-admin` with env vars set

**Patterns to follow:**

- Existing seed script structure in `packages/db/src/seed.ts`
- Env var reading pattern in `apps/api/src/env.ts`

**Test scenarios:**

- Happy path: running with valid `ADMIN_EMAIL` + `ADMIN_PASSWORD` inserts a user row, then login succeeds
- Edge case: running a second time with the same email is a no-op (no duplicate key error)
- Edge case: running with missing env vars logs a clear error message and exits non-zero
- Error path: invalid email format → validation error with message, not a DB error

**Verification:**

- After `make create-admin`, navigating to `localhost:4000` and logging in with the provided credentials succeeds
- Running `make create-admin` twice in a row does not throw an error

---

- [ ] **Unit 1.3: ISR revalidation webhook triggered from API**

**Goal:** Publishing, updating, or deleting content in the admin triggers ISR revalidation on the public site. Live site reflects changes within 5 seconds.

**Requirements:** R3

**Dependencies:** Unit 1.2 (deployer must have a working setup to test end-to-end)

**Files:**

- Create: `apps/api/src/lib/revalidate.ts`
- Modify: `apps/api/src/services/blog.ts`
- Modify: `apps/api/src/services/team.ts`
- Modify: `apps/api/src/services/testimonials.ts`
- Modify: `apps/api/src/services/portfolio.ts`
- Modify: `apps/api/src/services/settings.ts`
- Modify: `apps/api/src/env.ts` _(add `REVALIDATE_SECRET`, `WEB_URL` vars)_
- Modify: `apps/api/.env.example`
- Test: `apps/api/src/lib/revalidate.test.ts`

**Approach:**

- Create `revalidate.ts` utility: `revalidatePaths(paths: string[])` — fire-and-forget POST to `${WEB_URL}/api/revalidate` with `{ secret, paths }` body. Log on failure, never throw.
- Call from service functions after successful DB mutation:
  - Blog create/update/delete/publish → `['/blog', '/blog/:slug', '/']`
  - Team create/update/delete → `['/team', '/about']`
  - Testimonials create/update/delete → `['/testimonials', '/']`
  - Portfolio create/update/delete → `['/portfolio', '/']`
  - Settings upsert → `['/']` + all paths (revalidate tag `"settings"`)
- Add `REVALIDATE_SECRET` and `WEB_URL` to env schema. Both optional with graceful no-op when absent (same pattern as `RESEND_API_KEY`).

**Patterns to follow:**

- `RESEND_API_KEY` optional env var pattern in `apps/api/src/env.ts` and `email.ts`
- Fire-and-forget with error logging (not throwing) pattern used in email notifications

**Test scenarios:**

- Happy path: `revalidatePaths(['/blog'])` POSTs to `WEB_URL/api/revalidate` with correct body and secret
- Error path: target URL unreachable → logs error, function resolves without throwing
- Error path: `WEB_URL` not set → function is a no-op, no error thrown
- Integration: after `publishPost()` succeeds, `revalidatePaths` is called with blog-relevant paths
- Integration: after `upsertSettings()` succeeds, revalidation is triggered

**Verification:**

- Publish a blog post in admin; within 5 seconds, the public `/blog` and post page serve the updated content without a hard reload
- Stopping the web server and calling a service function completes without crashing the API

---

- [ ] **Unit 1.4: `ai.txt` route**

**Goal:** `GET /ai.txt` returns a machine-readable permissions manifest declaring the site's MCP endpoint and allowed agent operations. Requirement R5 from the vision reset is fulfilled.

**Requirements:** R4

**Dependencies:** None

**Files:**

- Create: `apps/web/app/ai.txt/route.ts`
- Modify: `apps/web/app/sitemap.ts` _(exclude `/ai.txt` from sitemap — it is a manifest, not a page)_

**Approach:**

- Mirror the `apps/web/app/llms.txt/route.ts` pattern
- Content structure:

  ```
  # AI Permissions
  User-agent: *
  Allow: /

  # MCP Server
  MCP: {API_URL}/mcp

  # Allowed agent operations
  Read: blog posts, team members, portfolio, testimonials, settings
  Write: contact inquiries (via POST /api/v1/contact)

  # Rate limits
  Rate-limit: 20 requests per minute
  ```

- Reads `siteConfig.url` and `process.env.NEXT_PUBLIC_API_URL` for dynamic values
- Returns `Content-Type: text/plain`; set `Cache-Control: public, max-age=3600`

**Patterns to follow:**

- `apps/web/app/llms.txt/route.ts` for the Route Handler structure
- `apps/web/app/robots.ts` for the static-with-dynamic-values pattern

**Test scenarios:**

- Happy path: `GET /ai.txt` returns 200 with `Content-Type: text/plain`
- Happy path: response body contains `MCP:` line with the configured API URL
- Edge case: `NEXT_PUBLIC_API_URL` not set → falls back to `http://localhost:3001` (dev default)

**Verification:**

- `curl localhost:3000/ai.txt` returns the manifest with the correct MCP URL
- Content is valid plain text that an AI agent could parse

---

- [ ] **Unit 1.5: Remove broken scripts and clean up stale config**

**Goal:** No script in `package.json` crashes immediately. Stale changeset config, dead ADR references, and unused deps are cleaned up.

**Requirements:** R10

**Dependencies:** None

**Files:**

- Delete: `scripts/verify-parity.ts`
- Delete: `scripts/generate-openapi.ts`
- Modify: `package.json` _(remove `parity:check` and `generate:openapi` scripts)_
- Modify: `.changeset/config.json` _(fix `ignore` array, fix repo URL placeholder)_
- Modify: `docs/adr/0006-auth-provider-adapter.md` _(mark superseded, add note on current auth)_
- Modify: `docs/adr/0007-worker-bullmq.md` _(mark superseded, add note on current no-queue state)_
- Modify: `docs/adr/0008-feature-flags.md` _(mark superseded)_
- Modify: `apps/web/package.json` _(remove `gray-matter` if unused after Unit 1.1; keep `next-mdx-remote`)_

**Approach:**

- Delete the two script files and their `package.json` entries
- Update `.changeset/config.json`: remove `cron`, `platform-api`, `worker`, `mcp`, `docs-site` from `ignore`; update repo URL to actual repo
- Add `status: superseded` header to ADR-0006, 0007, 0008 with a one-paragraph current-state note
- After Unit 1.1 lands: if `gray-matter` is still not imported anywhere, remove it from `apps/web/package.json`

**Test scenarios:**

- Test expectation: none — no behavioral change; verify by running `pnpm run --filter root` and confirming deleted scripts are gone

**Verification:**

- `pnpm parity:check` and `pnpm generate:openapi` no longer exist as runnable commands
- `pnpm changeset` does not warn about unknown packages in `ignore`
- ADR files have accurate status headers

---

### Phase 2 — Deployment Readiness

- [ ] **Unit 2.1: API Dockerfile and deployment configs**

**Goal:** `apps/api` has a multi-stage Dockerfile. Each app has a platform deployment config. A deployer can follow `README.md` to ship all three apps without guesswork.

**Requirements:** R6

**Dependencies:** None (parallel with Phase 1)

**Files:**

- Create: `apps/api/Dockerfile`
- Create: `apps/api/railway.json` _(or `render.yaml`)_
- Create: `apps/web/vercel.json`
- Create: `apps/admin/vercel.json`
- Create: `infra/deploy.md` _(step-by-step deployment guide)_
- Modify: `README.md` _(update deployment section to reference deploy.md)_
- Modify: `apps/web/Dockerfile` _(rewrite to multi-stage; fix reinstall-on-every-build issue)_

**Approach:**

- `apps/api/Dockerfile`: multi-stage Node 20-alpine; `pnpm install --frozen-lockfile` in builder stage; copy dist only in runtime stage; set `NODE_ENV=production`; expose port 3001; CMD `node dist/index.js`
- `apps/api/railway.json`: `startCommand: "node dist/index.js"`, `healthcheckPath: "/health"`, `buildCommand: "pnpm turbo run build --filter=api"`
- `apps/web/vercel.json` and `apps/admin/vercel.json`: set `rootDirectory` to the app subdirectory; `framework: "nextjs"`; `installCommand: "pnpm install --frozen-lockfile"`
- `apps/web/Dockerfile` rewrite: multi-stage like `apps/admin/Dockerfile` — builder stage installs deps and builds; runtime stage copies `.next/standalone`

**Patterns to follow:**

- `apps/admin/Dockerfile` — already multi-stage; mirror its structure for web and api

**Test scenarios:**

- Happy path: `docker build -f apps/api/Dockerfile .` succeeds from repo root
- Happy path: `docker build -f apps/web/Dockerfile .` succeeds from repo root
- Happy path: api container starts and `GET /health` returns 200
- Edge case: missing env vars at container start → clear error log, non-zero exit (not silent hang)

**Verification:**

- All three Dockerfiles build without error locally
- `railway up` or Vercel import with the provided configs deploys without manual settings override

---

- [ ] **Unit 2.2: Admin search backend**

**Goal:** The admin search bar returns real results for blog posts, team members, and portfolio entries.

**Requirements:** R5

**Dependencies:** Unit 2.1 is not a hard dependency, but search needs the API running

**Files:**

- Create: `apps/admin/app/api/search/route.ts`
- Modify: `apps/api/src/routes/blog.ts` _(add `?search=` query param support)_
- Modify: `apps/api/src/routes/team.ts` _(add `?search=` query param support)_
- Modify: `apps/api/src/routes/portfolio.ts` _(add `?search=` query param support)_
- Test: `apps/admin/app/api/search/route.test.ts`
- Test: `apps/api/src/routes/blog.test.ts` _(search param coverage)_

**Approach:**

- Express routes: add optional `?search=term` to existing list endpoints; use Drizzle `ilike` on `title` + `content`/`description` columns; return existing pagination shape
- Next.js Route Handler: `GET /api/search?q=term` — auth-check via `serverFetch`, parallel-fetch from three Express endpoints, merge into `{ id, kind, title, url }` shape matching existing `SearchResult` type in `search-bar.tsx`
- Kind mapping: `blog` → `/blog/:slug`, `team` → `/team#:id`, `portfolio` → `/portfolio#:id`
- Return at most 10 results total (3–4 per kind)

**Patterns to follow:**

- `apps/admin/lib/api.ts` `serverFetch` for authenticated Express calls
- Existing search bar `SearchResult` type in `apps/admin/app/(dashboard)/search-bar.tsx`

**Test scenarios:**

- Happy path: query `"design"` returns matching blog posts and portfolio entries
- Happy path: empty query returns `[]` without hitting Express
- Edge case: one Express endpoint is slow (>500ms) — other results still return (use `Promise.allSettled`)
- Edge case: no matches → `[]` not an error
- Error path: unauthenticated request to `/api/search` → 401
- Integration: result URL for a blog post navigates correctly when clicked in the SearchBar

**Verification:**

- Type "design" in admin search bar → results appear in dropdown within 300ms
- Keyboard navigation (ArrowUp/Down + Enter) navigates to the result URL

---

### Phase 3 — Observability & Quality

- [ ] **Unit 3.1: Wire pino structured logging in `apps/api`**

**Goal:** All `console.log`/`console.error` calls in `apps/api` are replaced with the `pino` logger from `@repo/observability`. Production logs are structured JSON with sensitive field redaction active.

**Requirements:** R7

**Dependencies:** None

**Files:**

- Create: `apps/api/src/lib/logger.ts` _(singleton: `createLogger({ service: "api", env })` )_
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/src/middleware/error-handler.ts`
- Modify: `apps/api/src/middleware/request-id.ts` _(or wherever request logging occurs)_
- Modify: `apps/api/src/routes/*.ts` _(replace console calls)_
- Modify: `apps/api/src/services/*.ts` _(replace console calls)_
- Modify: `apps/api/src/lib/revalidate.ts` _(from Unit 1.3 — use logger from start)_
- Test: `apps/api/src/lib/logger.test.ts`

**Approach:**

- Create `apps/api/src/lib/logger.ts` as a module-level singleton using `createLogger` — mirrors the `aiServiceSingleton` pattern already in the codebase
- Replace all `console.log` → `logger.info`, `console.error` → `logger.error`, `console.warn` → `logger.warn`
- Pass `requestId` (from request-id middleware) into log calls where available via `logger.child({ requestId })`
- The `createLogger` redaction already masks `password`, `token`, `secret`, `authorization` — verify coverage against actual log fields in the API

**Patterns to follow:**

- `apps/api/src/lib/ai-service.ts` `aiServiceSingleton` for the module-level logger singleton pattern
- `packages/observability/src/logger.ts` — existing `createLogger` API

**Test scenarios:**

- Happy path: `logger.info({ userId }, "request processed")` produces JSON with `level`, `time`, `service`, `msg`, `userId`
- Security: `logger.info({ password: "secret123" })` produces output where password value is `"[REDACTED]"`
- Security: `logger.info({ authorization: "Bearer tok" })` produces redacted output
- Edge case: logger in test environment (`NODE_ENV=test`) does not write to stdout (or writes quietly — adjust to what `createLogger` provides)

**Verification:**

- `NODE_ENV=production pnpm dev:api` → log lines are JSON objects, not human-readable strings
- No `console.log` or `console.error` calls remain in `apps/api/src/`

---

- [ ] **Unit 3.2: API route integration tests**

**Goal:** Core API routes have integration tests covering happy path, auth guard, validation, and error handling. CI has meaningful test coverage to catch regressions.

**Requirements:** R8

**Dependencies:** Unit 3.1 (logger should be wired before tests run, to avoid console noise)

**Files:**

- Create: `apps/api/src/routes/blog.test.ts`
- Create: `apps/api/src/routes/contacts.test.ts`
- Create: `apps/api/src/routes/auth.test.ts`
- Create: `apps/api/vitest.config.ts` _(if not present)_
- Modify: `apps/api/package.json` _(add `test` script if missing)_

**Approach:**

- Use `vitest` (already in monorepo via `@repo/config`) with `supertest` for HTTP-level testing
- Spin up the Express app in test mode; use in-memory SQLite or test Postgres instance
- Test structure: `describe('POST /api/v1/contact')` → `it('returns 201 with valid payload')` etc.
- Do not mock the DB at the service level — use real Drizzle queries against a test DB (the pattern from the session summary indicates this is preferred)
- Seed minimal test fixtures per test file

**Test scenarios to cover:**

_Blog routes:_

- `GET /api/v1/blog` returns published posts only (not drafts) for public requests
- `GET /api/v1/blog/:slug` returns 404 for unknown slug
- `POST /api/v1/blog` without auth cookie → 401
- `POST /api/v1/blog` with auth + valid payload → 201 with created post
- `PUT /api/v1/blog/:id/publish` transitions status from `draft` to `published`
- `GET /api/v1/blog?search=term` returns only matching posts

_Contact routes:_

- `POST /api/v1/contact` with valid payload → 201
- `POST /api/v1/contact` with missing `message` field → 422 with Zod error details
- `POST /api/v1/contact` rate-limited after 5 requests/minute

_Auth routes:_

- `POST /auth/sign-in/email` with valid credentials → sets session cookie
- `POST /auth/sign-in/email` with invalid password → 401
- `GET /api/v1/blog` (admin list) without session cookie → 401

**Verification:**

- `pnpm turbo run test` runs at least 20 test cases across the three test files
- CI passes with these tests included

---

- [ ] **Unit 3.3: Status page with real template service data**

**Goal:** `/status` reflects the actual services in this template (Web, Admin, API, Database) instead of the old SaaS platform's services. Remove fabricated latency numbers and made-up uptime history.

**Requirements:** R9

**Dependencies:** None

**Files:**

- Modify: `apps/web/app/status/page.tsx`

**Approach:**

- Replace hardcoded service list with: Web (Next.js), Admin CMS (Next.js), API (Express), Database (Postgres)
- Remove `latency` and uptime history columns — these require real monitoring that the template doesn't have
- Keep the `operational` / `degraded` / `outage` type system but set all to `operational` as static defaults
- Add a clear callout: "This is a template status page. Wire up a real monitoring service (BetterUptime, StatusPage.io) for production."
- Remove the `2025-10-01` → `2026-03-31` fabricated uptime history

**Test scenarios:**

- Test expectation: none — visual/content change only; verify via browser that service names match template reality

**Verification:**

- `/status` shows Web, Admin CMS, API, Database — not "Builder", "Webhooks", "Analytics", "Media CDN"
- No latency columns with fake numbers visible

---

### Phase 4 — Content & UX Enhancements

- [ ] **Unit 4.1: Admin rich-text / Markdown editor**

**Goal:** The blog post editor in admin provides a simple Markdown toolbar or preview pane so editors understand they're writing Markdown — and can preview the rendered output before publishing.

**Requirements:** Enhances R1

**Dependencies:** Unit 1.1 (Markdown rendering must exist first)

**Files:**

- Modify: `apps/admin/app/(dashboard)/blog/blog-form.tsx`
- Modify: `apps/admin/package.json` _(add preview-capable editor if chosen)_

**Approach:**

- Option A (minimal): Add a "Preview" toggle tab above the textarea that renders the content with `next-mdx-remote` in a read-only div. Zero new deps.
- Option B (editor): Replace `<Textarea>` with a lightweight Markdown editor (e.g., `@uiw/react-md-editor` or `milkdown`) with syntax highlighting and toolbar. New dep.
- Recommend Option A for this phase — matches the "low carrying cost" principle; editors who need more can upgrade.
- Add a hint below the textarea: "Supports Markdown: **bold**, _italic_, `code`, # headings"

**Patterns to follow:**

- `apps/admin/app/(dashboard)/ai/ai-assistant.tsx` tab UI pattern for Preview/Edit toggle

**Test scenarios:**

- Happy path: switch to Preview tab with `# Hello` content → renders as `<h1>Hello</h1>`
- Edge case: empty content → Preview shows nothing (no crash)
- Edge case: switching Edit → Preview → Edit preserves draft content

**Verification:**

- Blog editor has Preview tab; Markdown renders correctly in preview
- Existing blog save/publish flow unchanged

---

- [ ] **Unit 4.2: Magic link / forgot password UI**

**Goal:** Admin users who forget their password can receive a magic link via email without out-of-band DB access. The login page has a "Forgot password?" link.

**Requirements:** Template usability (not in R1–R10 but addresses a critical UX gap)

**Dependencies:** Unit 1.2 (admin user creation must exist); `RESEND_API_KEY` must be set for email delivery

**Files:**

- Create: `apps/admin/app/(auth)/forgot-password/page.tsx`
- Create: `apps/admin/app/(auth)/magic-link/page.tsx`
- Modify: `apps/admin/app/(auth)/login/page.tsx` _(add "Forgot password?" link)_
- Modify: `apps/auth/src/index.ts` _(enable magic link in better-auth config if not already)_

**Approach:**

- `better-auth` already has magic link support in its config (`emailVerification.sendVerificationEmail`); it's just disabled in the UI
- Forgot-password page: single email input form → calls `POST /auth/magic-link` → shows "Check your email" confirmation
- Magic link landing page: reads `?token=` from URL → calls better-auth token verification → redirects to dashboard on success, shows error on invalid/expired token
- Graceful no-op when `RESEND_API_KEY` not set: show "Email delivery not configured — contact your administrator" message

**Patterns to follow:**

- `apps/admin/app/(auth)/login/page.tsx` for the auth page layout
- better-auth magic link docs for the exact endpoint and token verification API

**Test scenarios:**

- Happy path: submit valid admin email → receives magic link email (check Resend logs)
- Happy path: click magic link → logged in, redirected to dashboard
- Error path: magic link token expired → error message, link to request new one
- Error path: `RESEND_API_KEY` not set → informative error, not a 500
- Edge case: unknown email address → same "check your email" response (no user enumeration)

**Verification:**

- Login page shows "Forgot password?" link
- Submitting the form with a valid admin email sends a magic link email
- Clicking the link logs in successfully

---

## System-Wide Impact

- **ISR revalidation (Unit 1.3):** All content mutation services gain a side-effect. If `WEB_URL` or `REVALIDATE_SECRET` are misconfigured, the side-effect is silent no-op — does not break mutations. Existing route tests must account for this new call.
- **Pino logging (Unit 3.1):** `console.log` removal is a correctness improvement in production; no functional behavior change in dev (pino pretty-print matches readability). Tests that assert on `console.log` output will break — update them to use logger spies.
- **Markdown rendering (Unit 1.1):** Blog post page changes from static text to dynamic RSC serialization. Cold-start latency may increase slightly; ISR caching (existing `revalidate: 60`) mitigates this at scale.
- **Admin search (Unit 2.2):** New unauthenticated surface at `GET /api/v1/blog?search=` on Express (the Route Handler authenticates; the Express endpoint does not need auth for public content). Portfolio and team endpoints are public reads — consistent with existing pattern.
- **Unchanged invariants:** The architecture constraint (Next.js apps are standalone UI consumers, no direct DB access) is preserved throughout. All new API calls go through the Express API.

## Risks & Dependencies

| Risk                                                                                   | Mitigation                                                                                                      |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `next-mdx-remote` RSC serialization performance on blog list page                      | Blog list does not render content body; only slug/title/excerpt. Only the detail page serializes. Bounded risk. |
| better-auth `createUser` admin utility API surface changes between versions            | Pin to current `better-auth` version; test the seed script in CI                                                |
| ISR webhook adds latency to content mutations if `WEB_URL` is slow                     | Fire-and-forget with a short timeout (500ms max); mutation response is not blocked                              |
| Pino replacement breaks existing tests that spy on `console.error`                     | Audit test files for `console.error` mocks before landing Unit 3.1                                              |
| Admin search `Promise.allSettled` still returns partial results if one endpoint is 503 | Log partial failures; acceptable degradation for a search feature                                               |
| Railway `railway.json` format changes between CLI versions                             | Pin CLI version in CI; test with `railway validate`                                                             |

## Documentation / Operational Notes

- `infra/deploy.md`: step-by-step first-deploy guide for Railway (API) + Vercel (web + admin) + Neon (Postgres). Include env var checklist and `make create-admin` step.
- Update `README.md` "Deployment" section to link to `infra/deploy.md` rather than prose.
- Update `apps/api/.env.example` with `REVALIDATE_SECRET` and `WEB_URL`.
- Each Phase 2 unit that introduces new env vars must update both `.env.example` and the env validation schema in `apps/api/src/env.ts`.

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-23-vision-reset-requirements.md`
- **Completed plan:** `docs/plans/2026-04-23-001-refactor-vision-reset-website-template-plan.md`
- Related code: `apps/web/app/api/revalidate/route.ts` (ISR webhook handler)
- Related code: `apps/web/app/llms.txt/route.ts` (ai.txt pattern reference)
- Related code: `packages/observability/src/logger.ts` (pino implementation)
- Related code: `apps/api/src/lib/ai-service.ts` (singleton pattern reference)
- Related code: `apps/admin/app/(dashboard)/search-bar.tsx` (SearchResult type)
- External: `next-mdx-remote` v5 RSC docs
- External: Railway deployment documentation
- External: Vercel monorepo deployment documentation
