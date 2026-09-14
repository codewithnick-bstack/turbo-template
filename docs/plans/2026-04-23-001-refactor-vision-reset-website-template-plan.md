---
title: "refactor: Vision Reset — AI-First Business Website Template"
type: refactor
status: complete
date: 2026-04-23
origin: docs/brainstorms/2026-04-23-vision-reset-requirements.md
---

# refactor: Vision Reset — AI-First Business Website Template

## Overview

The repo accumulated 16 packages and 6 apps building a multi-tenant SaaS platform when the actual goal is a single-business website template a developer can clone, customize in one config file, and deploy. This plan tears down the SaaS platform layer and rebuilds around three apps and six packages, with a strict architecture rule: Next.js apps are standalone UI consumers that talk to a single Express API exclusively over HTTP.

## Problem Frame

A dev cloning today gets a website-builder SaaS product, not a business website. The reset produces: `apps/web` (complete public site with all standard business pages), `apps/admin` (lightweight CMS), `apps/api` (Express: REST + MCP combined). No shared business-logic packages in Next.js apps.

## Requirements Trace

- R1. Complete website out of the box — all 10+ business pages, realistic placeholder content
- R2. Hybrid content model — static layout in code, dynamic content (blog/team/testimonials/portfolio) in DB via admin
- R3. `brand.config.ts` — one file controls all brand tokens; zero hardcoded business names/colors outside it
- R4. AI-first — visitor chatbot grounded in site content; admin AI draft tools; full MCP access for agents
- R5. SEO + GEO — per-page metadata, sitemap, JSON-LD, `llms.txt`, `ai.txt`
- R6. Theme system — CSS custom properties, dark mode, Storybook
- R7. Simple secure admin CMS — single-user auth, blog/team/testimonials/portfolio/contacts/settings
- R8. Production-grade tooling — Turborepo, Drizzle, CI, Docker Compose, Makefile

## Architecture Constraint (non-negotiable)

`apps/web` and `apps/admin` import **zero** business-logic `@repo/*` packages at runtime. Only `packages/config` (tsconfig/eslint) and `packages/ui` (components, CSS tokens) are shared with Next.js apps. Everything else — DB, auth, AI, email — lives in `apps/api`.

```
apps/web   (Next.js, no @repo/* business deps)  ──► apps/api (Express 5)
apps/admin (Next.js, no @repo/* business deps)  ──►   ├── REST  /api/v1/*
                                                        ├── Auth  /auth/*
                                                        └── MCP   /mcp
                                                             │
                                                   packages/{db,auth,ai,observability}
```

## Scope Boundaries

- No multi-tenancy — one deployment = one business
- No Stripe billing
- No visual page builder
- No BullMQ worker — email is synchronous Resend call in Express route
- No analytics platform — embed Vercel Analytics or Plausible script
- No agency/client workspace features

### Deferred to Separate Tasks

- `apps/docs` — Nextra docs site; README covers it for now
- Chatbot lead capture — Phase 2 feature
- pgvector RAG for chatbot — optional upgrade path; MVP uses simple DB keyword search

## Context & Research

### Current State (what exists today)

- **6 apps:** admin, docs, mcp, platform-api, web, worker
- **16 packages:** ai, auth, billing, cli, config, core, db, eslint-config, flags, observability, renderer-blocks, schemas, sdk, search, test-utils, ui
- **API framework:** Hono (not Express) in platform-api and mcp — new apps/api will be Express 5
- **apps/web:** already near-standalone; only imports `@repo/renderer-blocks` and `@repo/schemas` — easiest migration
- **apps/admin:** deep deps on `@repo/sdk`, `@repo/billing`, `@repo/schemas`, `@repo/ui` — major rewrite required
- **apps/mcp:** pure proxy over `@repo/sdk` PlatformClient — all tools rewrite against direct service functions
- **packages/db:** has tables for all deleted domains (sites, pages, forms, analytics, experiments, etc.) — needs new simplified schema
- **Theme:** two layers — `packages/ui/src/tokens.css` (structural: spacing/radius/typography) + per-app `globals.css` (semantic color tokens as CSS vars); Tailwind v4 with no config file

### Packages Being Deleted

| Package           | Reason                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| `billing`         | No billing in single-site template                                         |
| `core`            | Domain services replaced by co-located modules in `apps/api/src/services/` |
| `sdk`             | No external SDK consumers; MCP tools go direct                             |
| `schemas`         | Zod schemas co-located in each app                                         |
| `renderer-blocks` | Page builder not needed; web uses its own components                       |
| `search`          | Full-text search via Postgres `tsvector` in `apps/api`                     |
| `flags`           | Use env vars directly                                                      |
| `cli`             | Out of scope                                                               |
| `test-utils`      | Inline helpers in each app                                                 |

### Apps Being Removed / Merged

| App            | Action                                                         |
| -------------- | -------------------------------------------------------------- |
| `platform-api` | Replaced by new `apps/api` (Express 5, ~20% of original scope) |
| `worker`       | Removed; email is synchronous in Express route                 |
| `mcp`          | Merged into `apps/api` at `/mcp`                               |
| `docs`         | Removed; deferred                                              |

### Key Existing Patterns to Carry Forward

- `packages/ui/src/tokens.css` — CSS var token system; keep and extend with semantic color vars
- `packages/ai/src/adapters/` — Anthropic/OpenAI/mock adapter pattern; keep as-is
- `packages/db/src/schema/blog.ts` — blog_posts table; keep and extend
- `apps/web/app/` — existing pages, components, sitemap.ts, robots.ts, opengraph-image.tsx; carry forward
- `apps/admin/app/(auth)/` — auth page shells; rewrite for better-auth
- `.github/workflows/ci.yml` — existing CI matrix; update to remove deleted jobs
- `infra/docker-compose.yml` — keep; update service list

### Institutional Learnings

- No prior solutions in `docs/solutions/` — this refactor sets the precedent
- `turbo.json` has a `generate:openapi` task writing to `packages/sdk/generated/**` — remove with sdk deletion
- CI has a `parity-check` job referencing `packages/core/src/parity.ts` — remove with core deletion

## Key Technical Decisions

- **Express 5 over Hono for apps/api:** User specified Express; Express 5 has async error handling built in, no need for custom middleware. Hono patterns from platform-api serve as reference for route structure, not technology.
- **better-auth for admin auth:** Express adapter, email+password + magic link, TypeScript-native, minimal setup for single-user. Replaces the custom JWT in `packages/auth` with a maintained library. `packages/auth` becomes a thin better-auth configuration wrapper used only by `apps/api`.
- **MCP co-located in Express via `@modelcontextprotocol/sdk`:** MCP server instantiated in `apps/api/src/mcp.ts`, registered as Express middleware at `/mcp`. Tools call service functions directly — no PlatformClient indirection.
- **DB schema simplified in place:** Keep `packages/db` but replace all domain tables with the 6 new tables. Single migration that drops the old schema and creates the new one. Drizzle ORM stays.
- **brand.config.ts at repo root:** A typed config object consumed at build time by both `apps/web` and `apps/admin` to inject CSS custom property values into `globals.css` via a `generateTokens()` utility in `packages/ui`. Zero runtime cost — tokens are inlined at build.
- **Chatbot grounding:** Simple full-text search (`tsvector`) over blog_posts + site_settings table. No pgvector for MVP. Chatbot endpoint in `apps/api` queries DB, injects context into LLM system prompt.
- **Next.js API communication:** Both Next.js apps use a thin local `lib/api.ts` file (not a shared package) that wraps `fetch` calls to `apps/api`. Each app defines its own types matching the API response shapes.

## Open Questions

### Resolved During Planning

- **Auth vendor:** better-auth — Express adapter + email+password + magic link; simplest complete solution for single-user
- **Framework:** Express 5 (user-specified, not Hono)
- **AI provider default:** Anthropic claude-haiku-4-5; mock in dev; adapter stays swappable to OpenAI
- **Chatbot grounding MVP:** Postgres `tsvector` keyword search; pgvector is optional upgrade path
- **Lead capture:** Phase 2 only; not in this plan

### Deferred to Implementation

- Exact better-auth session configuration (cookie vs JWT mode; decide during Unit 3.3)
- Whether `apps/admin` needs an independent API key for `apps/api` or trusts the same session cookie
- Final column names after schema migration (decide during Unit 2.1)
- OG image design (placeholder acceptable for launch)

## Output Structure

```
turbo-template/
├── apps/
│   ├── web/                    # Next.js 15 public website
│   │   ├── app/                # All business pages
│   │   ├── components/         # Local components (no @repo/* business deps)
│   │   └── lib/
│   │       ├── api.ts          # fetch wrapper → apps/api
│   │       └── brand.ts        # imports brand.config.ts
│   ├── admin/                  # Next.js 15 CMS dashboard
│   │   ├── app/
│   │   │   ├── (auth)/         # Login page
│   │   │   └── (dashboard)/    # CMS sections
│   │   └── lib/
│   │       └── api.ts          # fetch wrapper → apps/api (authenticated)
│   └── api/                    # Express 5 — REST + MCP
│       └── src/
│           ├── index.ts        # Entry point, Express app
│           ├── routes/         # blog, team, testimonials, portfolio, contact, settings, ai
│           ├── services/       # Business logic (DB queries)
│           ├── mcp.ts          # MCP server setup + tool registration
│           ├── auth.ts         # better-auth config
│           ├── middleware/     # error handler, cors, rate-limit, request-id
│           └── schemas/        # Zod schemas (local to api)
├── packages/
│   ├── ui/                     # Design system (shared: web + admin)
│   │   └── src/
│   │       ├── tokens.css      # Structural CSS vars
│   │       ├── brand-tokens.ts # generateTokens(brand) utility
│   │       └── components/     # Button, Input, Card, etc.
│   ├── db/                     # Drizzle (api-only)
│   │   └── src/
│   │       └── schema/         # blog_posts, team_members, testimonials,
│   │                           # portfolio_entries, contact_submissions, site_settings
│   ├── auth/                   # better-auth config (api-only)
│   ├── ai/                     # LLM adapters (api-only)
│   ├── config/                 # tsconfig + eslint (shared: all)
│   └── observability/          # Logger + errors (api-only)
└── brand.config.ts             # ONE FILE — business name, colors, fonts, social links
```

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

### brand.config.ts → CSS token flow

```
brand.config.ts                       packages/ui/src/brand-tokens.ts
{ primary: "#6366f1",          →      generateTokens(brand) →
  fontHeading: "Inter",                 "--color-primary: #6366f1;"
  businessName: "Acme Co" }             "--font-heading: 'Inter';"

↓ imported at build time
apps/web/app/layout.tsx        injects <style> tag with generated vars
apps/admin/app/layout.tsx      same
```

### apps/api request flow

```
HTTP request
   │
   ├── /auth/*         → better-auth handler (no Express middleware needed)
   ├── /api/v1/*       → authMiddleware → route handler → service → Drizzle → Postgres
   ├── /mcp            → MCP SDK handler (SSE/streamable-http)
   └── /health         → 200 OK
```

### Admin → API authentication

Admin `lib/api.ts` sends session cookie (set by better-auth) on every request. API middleware verifies session via better-auth `auth.api.getSession()`. No token duplication.

## Implementation Units

### Phase 1 — Teardown

- [x] **Unit 1.1: Delete removed apps**

  **Goal:** Remove `apps/platform-api`, `apps/worker`, `apps/mcp`, `apps/docs` from the repo and workspace config.

  **Requirements:** R8 (clean tooling baseline)

  **Dependencies:** None — do this first

  **Files:**
  - Delete: `apps/platform-api/` (entire directory)
  - Delete: `apps/worker/` (entire directory)
  - Delete: `apps/mcp/` (entire directory)
  - Delete: `apps/docs/` (entire directory)
  - Modify: `pnpm-workspace.yaml` — remove deleted app entries
  - Modify: `turbo.json` — remove `generate:openapi` task; remove worker/mcp/platform-api/docs from pipeline
  - Modify: `.github/workflows/ci.yml` — remove `parity-check` job; remove `security-audit` job referencing deleted apps; update build filter list
  - Modify: `.github/workflows/release.yml` — remove references to deleted apps

  **Approach:** Delete directories first; workspace config updates second; CI third. Turbo will error if workspace entries reference missing directories — fix workspace config immediately after deletes.

  **Test expectation:** None — teardown only. Verification: `pnpm install` succeeds; `pnpm turbo run build` does not reference deleted apps.

  **Verification:** `pnpm install --frozen-lockfile` passes; no references to deleted app names in CI workflows.

---

- [x] **Unit 1.2: Delete removed packages**

  **Goal:** Remove `packages/{billing,core,sdk,schemas,renderer-blocks,search,flags,cli,test-utils}`.

  **Requirements:** R8

  **Dependencies:** Unit 1.1

  **Files:**
  - Delete: `packages/billing/`, `packages/core/`, `packages/sdk/`, `packages/schemas/`, `packages/renderer-blocks/`, `packages/search/`, `packages/flags/`, `packages/cli/`, `packages/test-utils/`
  - Modify: `pnpm-workspace.yaml` — remove deleted package entries
  - Modify: `turbo.json` — remove any tasks referencing deleted packages
  - Modify: `apps/web/package.json` — remove `@repo/renderer-blocks`, `@repo/schemas` dependencies
  - Modify: `apps/admin/package.json` — remove `@repo/billing`, `@repo/schemas`, `@repo/sdk` dependencies
  - Modify: `packages/ai/package.json` — remove any deps on deleted packages
  - Modify: `packages/db/package.json` — remove any deps on deleted packages

  **Approach:** Delete directories; then run `pnpm install` to surface broken dep references in remaining apps; fix each broken package.json. TypeScript errors in apps/web and apps/admin from missing imports are expected — resolved in later units.

  **Test expectation:** None — teardown only.

  **Verification:** `pnpm install` completes without workspace resolution errors; deleted package names no longer appear in any `package.json` dependencies.

---

### Phase 2 — Simplify Packages

- [x] **Unit 2.1: Rebuild `packages/db` schema for website template**

  **Goal:** Replace all domain-specific tables (sites, pages, forms, analytics, experiments, etc.) with 6 tables needed by the website template. Single clean migration.

  **Requirements:** R2 (hybrid content model), R7 (admin CMS)

  **Dependencies:** Unit 1.2

  **Files:**
  - Delete: `packages/db/src/schema/sites.ts`, `pages.ts`, `forms.ts`, `analytics.ts`, `experiments.ts`, `search.ts`, `oauth_apps.ts`, `members.ts` (or equivalent)
  - Keep/simplify: `packages/db/src/schema/blog.ts` — trim to: `id`, `slug`, `title`, `excerpt`, `content` (markdown), `author`, `cover_image_url`, `status` (draft/published), `published_at`, `meta_title`, `meta_description`, `created_at`, `updated_at`
  - Create: `packages/db/src/schema/team.ts` — `id`, `name`, `title`, `bio`, `photo_url`, `order`, `linkedin_url`, `twitter_url`, `created_at`, `updated_at`
  - Create: `packages/db/src/schema/testimonials.ts` — `id`, `author_name`, `company`, `role`, `quote`, `rating` (1-5), `photo_url`, `featured`, `created_at`, `updated_at`
  - Create: `packages/db/src/schema/portfolio.ts` — `id`, `title`, `client`, `description`, `cover_image_url`, `images` (jsonb), `tags` (text[]), `url`, `order`, `status`, `created_at`, `updated_at`
  - Create: `packages/db/src/schema/contacts.ts` — `id`, `name`, `email`, `phone`, `subject`, `message`, `status` (new/read/archived), `created_at`
  - Create: `packages/db/src/schema/settings.ts` — `id` (single row), `business_name`, `tagline`, `email`, `phone`, `address`, `logo_url`, `primary_color`, `accent_color`, `font_heading`, `font_body`, `social_links` (jsonb), `seo_title`, `seo_description`, `updated_at`
  - Modify: `packages/db/src/schema/index.ts` — re-export only the 6 new schemas
  - Create: `packages/db/migrations/0006_website_template_reset.sql` — drops all old tables, creates new 6
  - Modify: `packages/db/src/seed.ts` — seed realistic placeholder data for all 6 tables

  **Approach:** Write the new schema files first. Then write the migration as a full reset (DROP TABLE IF EXISTS all old tables, CREATE TABLE new ones). Seed data should be complete enough that a freshly migrated DB produces a visually complete website with no empty sections.

  **Patterns to follow:** `packages/db/src/schema/blog.ts` existing structure; Drizzle pgTable + pgEnum patterns in existing schema files.

  **Test scenarios:**
  - Happy path: `pnpm db:migrate && pnpm db:seed` succeeds on clean Postgres; querying each table returns seeded rows
  - Happy path: running migration twice is idempotent (IF NOT EXISTS guards)
  - Edge case: `settings` table always has exactly one row (enforced by application logic, not DB constraint)

  **Verification:** `pnpm db:migrate` green; `pnpm db:seed` inserts at least 3 blog posts, 4 team members, 4 testimonials, 3 portfolio entries, and 1 settings row.

---

- [x] **Unit 2.2: Simplify `packages/auth` for better-auth + Express**

  **Goal:** Replace the current custom JWT session utilities with better-auth configured for single-user email+password + magic link. Used exclusively by `apps/api`.

  **Requirements:** R7 (secure admin login), R8

  **Dependencies:** Unit 2.1

  **Files:**
  - Delete: `packages/auth/src/session.ts`, `packages/auth/src/middleware.ts`, `packages/auth/src/provider.ts` (current custom JWT files)
  - Create: `packages/auth/src/index.ts` — better-auth `createAuth()` config with: database adapter (Drizzle), email+password provider, magic link provider (Resend), session cookie config
  - Modify: `packages/auth/package.json` — add `better-auth` dependency; remove old JWT deps

  **Approach:** better-auth `createAuth()` takes the Drizzle DB instance and returns an `auth` object. `apps/api/src/auth.ts` imports from `@repo/auth` and instantiates it with the DB client. The auth object's `handler` mounts at `/auth/*` in Express; `auth.api.getSession(req)` verifies sessions in middleware.

  **Test scenarios:**
  - Happy path: POST to `/auth/sign-in/email` with correct credentials returns session cookie
  - Error path: invalid credentials → 401
  - Error path: expired session cookie → 401 from `getSession()`
  - Happy path: magic link email triggers → link clicks → session created

  **Verification:** `packages/auth` typechecks cleanly; `apps/api` can import and instantiate auth without errors.

---

- [x] **Unit 2.3: Trim `packages/ai` to chatbot + generation only**

  **Goal:** Remove unused AI service modules (seo audit, experiments, etc.) tied to deleted features. Keep: model adapter, chatbot function, blog draft generator, meta generator.

  **Requirements:** R4

  **Dependencies:** Unit 1.2

  **Files:**
  - Modify: `packages/ai/src/index.ts` — export only: `createModelAdapter`, `chatWithContext`, `generateBlogDraft`, `generateMetaDescription`
  - Delete: any `packages/ai/src/agents/` or `packages/ai/src/generators/` files not related to blog/meta
  - Modify: `packages/ai/src/prompts.ts` — keep only CHATBOT_SYSTEM, BLOG_GENERATOR_SYSTEM, META_GENERATOR_SYSTEM prompts; remove SEO_AUDITOR, SITE_COPILOT etc.
  - Modify: `packages/ai/package.json` — remove any deps on deleted packages

  **Approach:** `chatWithContext(messages, contextDocs)` injects site content docs into system prompt before calling adapter. `generateBlogDraft(title, outline?)` returns markdown string. `generateMetaDescription(title, contentPreview)` returns ≤155 char string.

  **Test scenarios:**
  - Happy path: `chatWithContext` with empty context docs still returns a response
  - Happy path: `generateBlogDraft` with title only returns non-empty markdown
  - Error path: adapter unavailable (no API key) → throws descriptive error, not silent failure
  - Happy path: mock adapter returns deterministic output for tests

  **Verification:** `packages/ai` typechecks; all three exported functions work with mock adapter in unit tests.

---

- [x] **Unit 2.4: Add `brand-tokens.ts` utility to `packages/ui`**

  **Goal:** A `generateTokens(brand)` function that converts a `brand.config.ts` object into CSS custom property string, injected into `<style>` at layout level in both Next.js apps.

  **Requirements:** R3, R6

  **Dependencies:** None (additive to packages/ui)

  **Files:**
  - Create: `packages/ui/src/brand-tokens.ts` — `BrandConfig` type + `generateTokens(brand: BrandConfig): string` returning CSS vars string
  - Modify: `packages/ui/src/tokens.css` — add semantic color vars (`--color-primary`, `--color-accent`, `--font-heading`, `--font-body`) as CSS var references that brand-tokens will populate
  - Modify: `packages/ui/src/index.ts` — export `BrandConfig`, `generateTokens`

  **Approach:** `generateTokens` maps `brand.primaryColor → --color-primary`, `brand.fontHeading → --font-heading`, etc. Output is a plain CSS string. Next.js layouts call it at module level and inject via `<style dangerouslySetInnerHTML>` in `<head>`. No runtime cost — called during server render, result is static per deployment.

  **Test scenarios:**
  - Happy path: `generateTokens({ primaryColor: "#6366f1", ... })` returns string containing `--color-primary: #6366f1`
  - Edge case: missing optional fields (accent color) fall back to sensible defaults, not empty vars
  - Happy path: output is valid CSS (no syntax errors when injected into a style tag)

  **Verification:** `packages/ui` typechecks; snapshot test for `generateTokens` output.

---

### Phase 3 — Build `apps/api`

- [x] **Unit 3.1: Express 5 app scaffold**

  **Goal:** Bare Express 5 app with middleware stack, health route, error handler, env validation, and local dev server.

  **Requirements:** R8

  **Dependencies:** Units 2.2, 2.3

  **Files:**
  - Create: `apps/api/` (new directory)
  - Create: `apps/api/package.json` — deps: express@5, better-auth, @repo/db, @repo/auth, @repo/ai, @repo/observability; devDeps: tsx, typescript, @types/express
  - Create: `apps/api/src/index.ts` — Express app instance, middleware chain, route registration, listen
  - Create: `apps/api/src/env.ts` — Zod schema for required env vars: `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY` (optional), `AI_PROVIDER`, `ANTHROPIC_API_KEY` (optional), `PORT`
  - Create: `apps/api/src/middleware/cors.ts` — CORS allowing admin + web origins from env
  - Create: `apps/api/src/middleware/error-handler.ts` — Express 5 async error handler; maps AppError codes to HTTP status
  - Create: `apps/api/src/middleware/request-id.ts` — injects `x-request-id` header
  - Create: `apps/api/src/middleware/auth-guard.ts` — wraps `auth.api.getSession()`, returns 401 if no session
  - Create: `apps/api/tsconfig.json`
  - Modify: `pnpm-workspace.yaml` — add `apps/api`
  - Modify: `turbo.json` — add api to build/dev/typecheck pipeline

  **Approach:** Express 5's native async error propagation means route handlers can `throw` without explicit `next(err)` calls. `env.ts` parsed at module load — process exits with clear message if required vars missing. Middleware order: cors → request-id → body-parser → routes → error-handler.

  **Patterns to follow:** `apps/platform-api/src/middleware/` structure; `packages/observability/src/errors.ts` AppError class.

  **Test scenarios:**
  - Happy path: `GET /health` returns `{ status: "ok", version }` with 200
  - Error path: missing `DATABASE_URL` at startup → process exits with readable message before binding port
  - Error path: unhandled thrown error in route → error handler returns `{ code, message }` JSON, not HTML stack trace

  **Verification:** `pnpm --filter api dev` starts server; `GET /health` returns 200; deliberate `throw new AppError("not_found", "x")` in a route returns `{ code: "not_found", message: "x" }` with 404.

---

- [x] **Unit 3.2: REST routes — content CRUD**

  **Goal:** Full CRUD REST API for blog, team, testimonials, portfolio, contact submissions, and site settings. Public read endpoints + auth-gated write endpoints.

  **Requirements:** R2, R7

  **Dependencies:** Unit 3.1, Unit 2.1

  **Files:**
  - Create: `apps/api/src/services/blog.ts` — list, get, create, update, delete, publish/unpublish
  - Create: `apps/api/src/services/team.ts` — list, get, create, update, delete, reorder
  - Create: `apps/api/src/services/testimonials.ts` — list, get, create, update, delete
  - Create: `apps/api/src/services/portfolio.ts` — list, get, create, update, delete
  - Create: `apps/api/src/services/contacts.ts` — list (auth-gated), markRead, archive; create (public, rate-limited)
  - Create: `apps/api/src/services/settings.ts` — get, update (upsert single row)
  - Create: `apps/api/src/routes/blog.ts` — GET /blog, GET /blog/:slug (public); POST/PATCH/DELETE /blog, POST /blog/:id/publish (auth-gated)
  - Create: `apps/api/src/routes/team.ts`, `routes/testimonials.ts`, `routes/portfolio.ts`, `routes/contacts.ts`, `routes/settings.ts` — same public/auth split pattern
  - Create: `apps/api/src/schemas/` — Zod schemas for each resource (request validation + response types)
  - Modify: `apps/api/src/index.ts` — register all routes

  **Approach:** Service functions take a `db` instance (from `@repo/db`) and typed input. Route handlers parse + validate with Zod, call service, return JSON. Public routes: GET blog, GET team, GET testimonials, GET portfolio. All write operations and contacts list require `authGuard` middleware. Contact form submission is public but rate-limited (5 req/min per IP).

  **Patterns to follow:** Route handler → service function split pattern from `apps/platform-api/src/routes/`.

  **Test scenarios:**
  - Happy path: `GET /api/v1/blog` returns array of published posts with correct shape
  - Happy path: `GET /api/v1/blog/:slug` returns single post; 404 for unknown slug
  - Error path: `POST /api/v1/blog` without session cookie → 401
  - Error path: `POST /api/v1/blog` with invalid body (missing title) → 422 with field errors
  - Error path: contact form submission rate limit → 429
  - Integration: `POST /api/v1/contacts` → row appears in DB → `GET /api/v1/contacts` (auth-gated) lists it with `status: "new"`
  - Happy path: `PATCH /api/v1/settings` updates single settings row; subsequent `GET /api/v1/settings` returns updated values

  **Verification:** All routes return correct status codes; auth-gated routes return 401 without session; Zod validation errors are structured (field-level, not generic 500).

---

- [x] **Unit 3.3: Auth routes (better-auth)**

  **Goal:** Mount better-auth handler in Express so admin can log in with email+password or magic link. Session cookie set on success.

  **Requirements:** R7

  **Dependencies:** Unit 3.1, Unit 2.2

  **Files:**
  - Create: `apps/api/src/auth.ts` — instantiates better-auth `createAuth()` with Drizzle adapter + providers
  - Modify: `apps/api/src/index.ts` — mount `auth.handler` at `/auth/*` before other routes
  - Create: `apps/api/src/middleware/auth-guard.ts` — imports `auth` instance, calls `auth.api.getSession(req)`, attaches to `req.session`; returns 401 if null

  **Approach:** better-auth's Express integration uses `toNodeHandler(auth)` to wrap its handler for Express. Single admin user seeded from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars on first startup (if no users exist). Magic link emails sent via Resend.

  **Test scenarios:**
  - Happy path: `POST /auth/sign-in/email` with correct credentials returns 200 + sets session cookie
  - Error path: wrong password → 401
  - Happy path: magic link sent to correct email → link in email → clicking it establishes session
  - Error path: accessing `GET /api/v1/contacts` without valid session → 401
  - Happy path: `POST /auth/sign-out` clears session cookie

  **Verification:** `apps/admin` login flow connects end-to-end; session cookie present in subsequent authenticated requests.

---

- [x] **Unit 3.4: MCP server — content tools**

  **Goal:** Mount an MCP server in `apps/api` at `/mcp` exposing all content operations as agent tools.

  **Requirements:** R4 (agent access via MCP)

  **Dependencies:** Unit 3.2

  **Files:**
  - Create: `apps/api/src/mcp.ts` — MCP `Server` instance; registers all tools; exports Express router
  - Create: `apps/api/src/mcp-tools/blog.ts` — tools: `list_blog_posts`, `get_blog_post`, `create_blog_post`, `update_blog_post`, `publish_blog_post`
  - Create: `apps/api/src/mcp-tools/team.ts` — `list_team`, `add_team_member`, `update_team_member`, `remove_team_member`
  - Create: `apps/api/src/mcp-tools/testimonials.ts` — `list_testimonials`, `add_testimonial`, `update_testimonial`
  - Create: `apps/api/src/mcp-tools/portfolio.ts` — `list_portfolio`, `add_portfolio_entry`, `update_portfolio_entry`
  - Create: `apps/api/src/mcp-tools/contacts.ts` — `list_contacts`, `get_contact`, `archive_contact`
  - Create: `apps/api/src/mcp-tools/settings.ts` — `get_site_settings`, `update_site_settings`
  - Modify: `apps/api/src/index.ts` — mount MCP router at `/mcp`
  - Modify: `apps/api/package.json` — add `@modelcontextprotocol/sdk`

  **Approach:** Each MCP tool calls the corresponding service function directly (same functions used by REST routes). Tool input schemas defined as Zod schemas matching REST body schemas. MCP server uses streamable-http transport (`createExpressMiddleware` or equivalent from MCP SDK). Tool execution does not require auth session — API key in `MCP_API_KEY` env var checked via bearer token middleware before `/mcp`.

  **Patterns to follow:** MCP tool structure from old `apps/mcp/src/tools/`; service call pattern from Unit 3.2.

  **Test scenarios:**
  - Happy path: MCP tool `list_blog_posts` returns same data as `GET /api/v1/blog`
  - Happy path: MCP tool `create_blog_post` creates a post; subsequent `GET /api/v1/blog` includes it
  - Error path: MCP request without `Authorization: Bearer <MCP_API_KEY>` → 401
  - Error path: tool input fails Zod validation → MCP error response with field details
  - Integration: Claude Desktop (or agent harness) can call `create_blog_post` and see the post appear on the live site

  **Verification:** MCP manifest accessible at `/mcp`; `list_blog_posts` tool returns seeded posts; create + read round-trip works.

---

- [x] **Unit 3.5: AI routes — chatbot + content generation**

  **Goal:** Chatbot endpoint (used by `apps/web` widget) and content generation endpoints (used by `apps/admin`).

  **Requirements:** R4

  **Dependencies:** Unit 3.1, Unit 2.3, Unit 3.2

  **Files:**
  - Create: `apps/api/src/services/ai.ts` — `chatWithSiteContext(messages, db)` queries DB for relevant content via tsvector, calls `chatWithContext` from `@repo/ai`; `generateBlogDraft(title, outline?)` thin wrapper; `generateMeta(pageTitle, contentPreview)` thin wrapper
  - Create: `apps/api/src/routes/ai.ts` — `POST /api/v1/ai/chat` (public, rate-limited 20 req/min per IP); `POST /api/v1/ai/generate/blog-draft` (auth-gated); `POST /api/v1/ai/generate/meta` (auth-gated)
  - Modify: `apps/api/src/index.ts` — register ai routes

  **Approach:** `/ai/chat` accepts `{ messages: [{role, content}] }`. Service function runs tsvector search on blog_posts + site_settings for the last user message, builds context string, calls `chatWithContext`. Response: `{ text: string }`. When `AI_PROVIDER=mock` (dev), returns deterministic stubbed response. Graceful degradation: if AI call fails, return `{ text: null, fallback: true }` — frontend shows "contact us" CTA.

  **Test scenarios:**
  - Happy path: `POST /api/v1/ai/chat` with `AI_PROVIDER=mock` returns `{ text: "..." }` synchronously
  - Happy path: context search finds matching blog posts and injects them
  - Error path: AI provider API key missing → returns `{ text: null, fallback: true }`, not 500
  - Error path: chat rate limit exceeded → 429
  - Happy path: `POST /api/v1/ai/generate/blog-draft` returns markdown string
  - Error path: unauthenticated request to generate endpoints → 401

  **Verification:** Chat endpoint returns text with mock provider; rate limiting returns 429 after threshold.

---

- [x] **Unit 3.6: Email — contact form delivery**

  **Goal:** When a contact form submission is saved to DB, send a notification email to the business owner via Resend.

  **Requirements:** R7

  **Dependencies:** Unit 3.2

  **Files:**
  - Create: `apps/api/src/services/email.ts` — `sendContactNotification(contact, toEmail)` using Resend SDK; no-op with log when `RESEND_API_KEY` not set
  - Modify: `apps/api/src/services/contacts.ts` — call `sendContactNotification` after DB insert

  **Approach:** Synchronous Resend call in the request handler. If it fails, the contact is still saved (DB insert already committed); the email error is logged but does not return 500 to the visitor. `NOTIFICATION_EMAIL` env var controls where the notification goes (defaults to `ADMIN_EMAIL`).

  **Test scenarios:**
  - Happy path: contact submitted → notification email sent to `NOTIFICATION_EMAIL`
  - Edge case: `RESEND_API_KEY` not set → contact saved, email skipped, log entry written
  - Error path: Resend returns error → contact still saved, error logged, 200 returned to visitor
  - Happy path: email HTML includes visitor name, email, message

  **Verification:** With `RESEND_API_KEY` set in test env, contact submission triggers email delivery; without key, submission still returns 200.

---

### Phase 4 — Rebuild `apps/web`

- [x] **Unit 4.1: Remove shared package deps; add local API client**

  **Goal:** `apps/web` imports nothing from `@repo/schemas` or `@repo/renderer-blocks`. Add local `lib/api.ts` fetch wrapper for `apps/api`.

  **Requirements:** Architecture constraint (standalone)

  **Dependencies:** Unit 3.2 (API routes exist to call)

  **Files:**
  - Modify: `apps/web/package.json` — remove `@repo/schemas`, `@repo/renderer-blocks`
  - Create: `apps/web/lib/api.ts` — typed fetch wrapper; `API_URL` from `process.env.NEXT_PUBLIC_API_URL`; functions: `getBlogPosts()`, `getBlogPost(slug)`, `getTeam()`, `getTestimonials()`, `getPortfolio()`, `getSettings()`
  - Create: `apps/web/lib/types.ts` — local TypeScript types for API responses (duplicated from API schemas — intentional by architecture rule)
  - Modify: all files that imported from `@repo/schemas` or `@repo/renderer-blocks` → use local types + components

  **Test scenarios:**
  - Happy path: `getBlogPosts()` returns typed array when API is running
  - Edge case: API unreachable → function returns empty array with `console.error`; page renders with "no posts" state rather than crashing

  **Verification:** `pnpm --filter web typecheck` passes with no `@repo/schemas` or `@repo/renderer-blocks` imports.

---

- [x] **Unit 4.2: Add missing pages and complete all 10 business pages**

  **Goal:** Add `/team` and `/testimonials` pages; polish all existing pages to use realistic placeholder content from brand.config.ts and DB.

  **Requirements:** R1, R2

  **Dependencies:** Unit 4.1

  **Files:**
  - Create: `apps/web/app/team/page.tsx` — fetches `getTeam()`, renders grid of team members with photo, name, title, bio
  - Create: `apps/web/app/team/loading.tsx` — skeleton
  - Create: `apps/web/app/testimonials/page.tsx` — fetches `getTestimonials()`, renders testimonial cards with rating, quote, author
  - Create: `apps/web/app/testimonials/loading.tsx`
  - Modify: `apps/web/app/page.tsx` (home) — wire testimonials + team sections to live API data
  - Modify: `apps/web/app/blog/page.tsx` — wire to `getBlogPosts()` from `lib/api.ts`
  - Modify: `apps/web/app/blog/[slug]/page.tsx` — wire to `getBlogPost(slug)` from `lib/api.ts`
  - Modify: `apps/web/app/portfolio/page.tsx` — wire to `getPortfolio()`
  - Modify: `apps/web/app/contact/page.tsx` — contact form posts to `POST /api/v1/contacts`; success/error state

  **Approach:** Server components fetch from `apps/api` at request time. Use `Suspense` boundaries with skeleton loaders. Contact form is a Client Component (needs `useState`). Portfolio and blog pages use `generateStaticParams` + `revalidate: 60` for ISR-style caching.

  **Test scenarios:**
  - Happy path: `/team` renders all seeded team members
  - Happy path: `/blog` lists published posts; draft posts not visible
  - Happy path: `/blog/:slug` renders correct post; 404 for unknown slug
  - Happy path: contact form submission → API call → success message shown
  - Error path: API down → pages render with empty states, not uncaught errors

  **Verification:** All 10 pages render in browser with seeded data; no console errors on any page.

---

- [x] **Unit 4.3: Wire brand.config.ts into apps/web**

  **Goal:** `apps/web` reads `brand.config.ts` and injects generated CSS tokens into the layout. All hardcoded business names, colors, and fonts replaced.

  **Requirements:** R3, R6

  **Dependencies:** Unit 2.4

  **Files:**
  - Create: `brand.config.ts` (repo root) — typed `BrandConfig` object with realistic placeholder values: "Acme Studio", primary color, fonts, social links, contact info
  - Modify: `apps/web/app/layout.tsx` — import `brand.config.ts`, call `generateTokens(brand)`, inject `<style>` in `<head>`
  - Modify: `apps/web/lib/brand.ts` — re-exports brand config values for use in page metadata
  - Audit and modify: any component with hardcoded business names or colors → replace with brand values

  **Test scenarios:**
  - Happy path: changing `primaryColor` in `brand.config.ts` → CSS var changes → UI color updates on rebuild
  - Happy path: `businessName` from brand.config appears in page `<title>` and footer
  - Edge case: brand config with no `accentColor` set → default accent used, no CSS var empty string

  **Verification:** Zero hardcoded business names outside `brand.config.ts`; grep for "Acme" returns only `brand.config.ts` and seed data.

---

- [x] **Unit 4.4: SEO + GEO implementation**

  **Goal:** Per-page metadata, sitemap, robots.txt, JSON-LD schema, `llms.txt`, `ai.txt`.

  **Requirements:** R5

  **Dependencies:** Unit 4.2, Unit 4.3

  **Files:**
  - Modify: every `app/*/page.tsx` — add `generateMetadata()` using brand config + page-specific data
  - Modify: `apps/web/app/sitemap.ts` — include dynamic blog post slugs from API; include all static pages
  - Modify: `apps/web/app/robots.ts` — allow all crawlers; add sitemap URL
  - Create: `apps/web/app/llms.txt/route.ts` — dynamic route returning plain text: business name, what it does, who it serves, key pages with URLs, recent blog titles
  - Create: `apps/web/app/ai.txt/route.ts` — permissions for AI agents: allowed operations, contact endpoint, MCP manifest URL
  - Modify: `apps/web/components/json-ld.tsx` — Organization + WebSite schema on all pages; Article schema on blog posts; FAQPage on about/home
  - Modify: `apps/web/app/blog/[slug]/page.tsx` — Article JSON-LD with author, datePublished, dateModified
  - Modify: `apps/web/app/*/opengraph-image.tsx` (or create per-page) — OG images using Next.js ImageResponse

  **Approach:** `generateMetadata` on each page pulls from brand config for defaults and page-specific API data for overrides. `llms.txt` is a dynamic route that calls `getSettings()` + `getBlogPosts()` at request time and formats as structured plain text. `ai.txt` is a static file.

  **Test scenarios:**
  - Happy path: `<title>` on every page includes business name from brand config
  - Happy path: `/sitemap.xml` includes URLs for all blog posts
  - Happy path: `/llms.txt` returns plain text with business name and at least 3 blog post titles
  - Happy path: blog post page has `Article` JSON-LD with correct `headline` and `datePublished`
  - Happy path: `/robots.txt` allows all crawlers and includes Sitemap line
  - Happy path: OG image renders without error at `/_next/image`

  **Verification:** Lighthouse SEO score ≥ 95 on home and blog post pages; `llms.txt` machine-readable (confirm format with Perplexity's published spec).

---

- [x] **Unit 4.5: AI chatbot widget**

  **Goal:** Floating chatbot widget on all public pages. Calls `/api/v1/ai/chat`. Gracefully hides when AI is unavailable.

  **Requirements:** R4

  **Dependencies:** Unit 3.5, Unit 4.1

  **Files:**
  - Modify: `apps/web/components/chatbot-widget.tsx` — rewrite to use `fetch` against `NEXT_PUBLIC_API_URL/api/v1/ai/chat`; implement message history; loading indicator; fallback CTA to `/contact`
  - Modify: `apps/web/app/layout.tsx` — render `<ChatbotWidget>` (already present; wire to new API endpoint)

  **Approach:** Client Component. Maintains `messages` state. On send, appends user message, sends full history to API, appends assistant response. When API returns `{ fallback: true }`, shows "I'm unavailable right now — [contact us](/contact)" instead of a broken state. Widget starts collapsed as a floating button; expands on click.

  **Test scenarios:**
  - Happy path: user sends message → assistant responds within 3s (with real AI) or immediately (mock)
  - Error path: API returns `{ fallback: true }` → widget shows contact page CTA, not error message
  - Edge case: user sends empty message → no API call, no error
  - Edge case: widget closed and reopened → message history preserved in session

  **Verification:** Widget renders on all pages; responds to messages; fallback CTA visible when AI_PROVIDER not configured.

---

### Phase 5 — Rebuild `apps/admin`

- [x] **Unit 5.1: Strip admin of all business-logic package imports; add local API client**

  **Goal:** Remove all `@repo/billing`, `@repo/sdk`, `@repo/schemas` imports. Replace with HTTP client calling `apps/api`.

  **Requirements:** Architecture constraint (standalone)

  **Dependencies:** Unit 3.2, Unit 3.3

  **Files:**
  - Modify: `apps/admin/package.json` — remove `@repo/billing`, `@repo/sdk`, `@repo/schemas`; keep `@repo/ui`, `@repo/config`
  - Create: `apps/admin/lib/api.ts` — authenticated fetch wrapper: reads session cookie, calls `apps/api`; functions for all CMS operations
  - Create: `apps/admin/lib/types.ts` — local TypeScript types for API responses
  - Delete or rewrite: all files importing from `@repo/sdk`, `@repo/billing`, `@repo/schemas`

  **Approach:** Admin's `lib/api.ts` wraps `fetch` with `credentials: "include"` to send the session cookie set by better-auth. Functions: `createBlogPost`, `updateBlogPost`, `publishBlogPost`, `deleteBlogPost`, `listBlogPosts`, etc. — one function per REST endpoint. This file is the only place admin talks to the API; all components call these functions.

  **Test scenarios:**
  - Happy path: `listBlogPosts()` returns typed array from API
  - Error path: 401 from API → redirect to login page
  - Error path: 422 from API → surface field errors in form

  **Verification:** `pnpm --filter admin typecheck` passes with no `@repo/sdk`, `@repo/billing`, or `@repo/schemas` imports.

---

- [x] **Unit 5.2: Rebuild admin dashboard structure**

  **Goal:** Replace the multi-tenant sites/templates/agency dashboard with CMS-focused nav: Blog, Team, Testimonials, Portfolio, Contacts, Settings. Remove all deleted sections.

  **Requirements:** R7

  **Dependencies:** Unit 5.1

  **Files:**
  - Modify: `apps/admin/app/(dashboard)/layout.tsx` — update NAV array to: Blog, Team, Testimonials, Portfolio, Contacts, Settings
  - Delete: `apps/admin/app/(dashboard)/sites/` (entire directory)
  - Delete: `apps/admin/app/(dashboard)/templates/`
  - Delete: `apps/admin/app/(dashboard)/agency/`
  - Delete: `apps/admin/app/(dashboard)/media/`
  - Delete: `apps/admin/app/(dashboard)/forms/` (replaced by Contacts)
  - Delete: `apps/admin/app/(dashboard)/collections/`
  - Delete: `apps/admin/app/(dashboard)/analytics/`
  - Delete: `apps/admin/app/(dashboard)/billing/`
  - Modify: `apps/admin/app/(dashboard)/page.tsx` — dashboard home: show count of posts, team members, unread contacts; quick action buttons

  **Test expectation:** None — structural cleanup. Verification: all deleted routes return 404; remaining nav links resolve correctly.

  **Verification:** Admin nav shows exactly 6 items; dashboard home renders without errors.

---

- [x] **Unit 5.3: CMS sections — Blog, Team, Testimonials, Portfolio, Contacts, Settings**

  **Goal:** Full CRUD UI for all 6 CMS sections. Each section: list view → detail/edit form → save/delete actions.

  **Requirements:** R7

  **Dependencies:** Unit 5.2

  **Files:**
  - Create: `apps/admin/app/(dashboard)/blog/page.tsx` — list with status badges; publish toggle; delete; link to new
  - Create: `apps/admin/app/(dashboard)/blog/new/page.tsx` — create form (title, content markdown editor, cover image URL, excerpt); AI draft button
  - Create: `apps/admin/app/(dashboard)/blog/[id]/page.tsx` — edit form; publish/unpublish; delete
  - Create: `apps/admin/app/(dashboard)/team/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
  - Create: `apps/admin/app/(dashboard)/testimonials/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
  - Create: `apps/admin/app/(dashboard)/portfolio/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
  - Create: `apps/admin/app/(dashboard)/contacts/page.tsx` — inbox with mark-read/archive; no edit
  - Create: `apps/admin/app/(dashboard)/settings/page.tsx` — single settings form: business name, tagline, contact info, social links, SEO defaults, logo URL, color overrides
  - Modify: all section components import from `apps/admin/lib/api.ts` only

  **Approach:** Server Components for list/read pages (fetch on server); Client Components for forms (need `useState`). Use `@repo/ui` components (Button, Input, Card, etc.) for consistent styling. Markdown editor for blog content: simple `<textarea>` with preview toggle — no heavy WYSIWYG library. Toast notifications on save/error (existing toast setup).

  **Test scenarios:**
  - Happy path: create blog post → appears in list; edit → changes saved; publish → status changes
  - Happy path: contact inbox shows new submissions with unread badge; mark-read clears badge
  - Happy path: settings save → `GET /api/v1/settings` returns updated values
  - Error path: form submit with missing required field → inline error message from API 422 response
  - Happy path: AI draft button on blog new → calls generate endpoint → populates content textarea

  **Verification:** All 6 sections navigate correctly; CRUD operations round-trip with the API; blog publish state reflected immediately in list view.

---

- [x] **Unit 5.4: Admin auth flow**

  **Goal:** Login page using better-auth. Protected route middleware. Auto-redirect to login on 401.

  **Requirements:** R7

  **Dependencies:** Unit 3.3, Unit 5.1

  **Files:**
  - Modify: `apps/admin/app/(auth)/login/page.tsx` — email+password form + magic link option; POST to `API_URL/auth/sign-in/email`
  - Create: `apps/admin/app/(auth)/login/login-form.tsx` — Client Component with form state
  - Modify: `apps/admin/middleware.ts` — check for valid session cookie; redirect to `/login` if absent. Session validation: call `API_URL/auth/get-session` from middleware; if 401 → redirect
  - Modify: `apps/admin/app/(dashboard)/layout.tsx` — add sign-out button that calls `API_URL/auth/sign-out`

  **Approach:** Next.js middleware runs on every request to `/(dashboard)/` routes. It calls `apps/api/auth/get-session` with the cookie forwarded. If no valid session, redirect to `/login`. Login form posts credentials to Express `/auth/sign-in/email` which sets a `Set-Cookie` header; Next.js captures the cookie in the browser.

  **Test scenarios:**
  - Happy path: valid credentials → redirected to dashboard; cookie set
  - Error path: wrong password → error message displayed; no redirect
  - Happy path: accessing any `/dashboard/*` route without session → redirect to `/login?redirect=<original>`
  - Happy path: sign-out → cookie cleared → redirect to `/login`

  **Verification:** Accessing `/` in admin without session redirects to login; after login, protected pages load; sign-out clears session.

---

### Phase 6 — Polish

- [x] **Unit 6.1: Dark mode + theme finalization**

  **Goal:** Complete dark mode implementation in both apps. Ensure all pages respect the theme toggle. Verify brand tokens work in both modes.

  **Requirements:** R6

  **Dependencies:** Units 4.3, 5.2

  **Files:**
  - Modify: `apps/web/app/globals.css` — ensure all semantic color vars have `[data-theme="dark"]` variants
  - Modify: `apps/admin/app/globals.css` — same
  - Modify: `apps/web/components/theme-toggle.tsx` — verify toggle sets `data-theme` on `<html>`
  - Modify: `packages/ui/src/tokens.css` — ensure dark-mode-aware structural tokens

  **Test scenarios:**
  - Happy path: theme toggle switches dark/light; system preference respected on first load
  - Edge case: brand primary color in dark mode has sufficient contrast (WCAG AA)

  **Verification:** All pages in both light and dark mode pass visual check; no hardcoded colors remain.

---

- [x] **Unit 6.2: CI + tooling cleanup**

  **Goal:** Update CI, turbo.json, docker-compose, Makefile, and README to reflect the new 3-app, 6-package structure.

  **Requirements:** R8

  **Dependencies:** All previous units

  **Files:**
  - Modify: `.github/workflows/ci.yml` — remove `parity-check`, update build/test/typecheck to filter to `web`, `admin`, `api` + 6 packages; add Express API health check smoke test
  - Modify: `turbo.json` — clean pipeline to: `build`, `dev`, `typecheck`, `lint`, `test`, `db:migrate`, `db:seed`
  - Modify: `infra/docker-compose.yml` — keep only: `postgres`, `redis` (if needed) — remove references to deleted services
  - Modify: `Makefile` — update dev target: starts `api`, `web`, `admin` via turbo dev
  - Modify: `README.md` — complete rewrite: what this is, stack, quickstart (clone → edit brand.config.ts → make dev), project structure, deployment guide
  - Delete: all docs/plans and docs/brainstorms from the old SaaS platform era (or archive under `docs/archive/`)

  **Test expectation:** None — tooling and docs. Verification: CI green on a sample PR; `make dev` starts all 3 apps.

  **Verification:** CI green; `make dev` starts api on :3001, web on :3000, admin on :3002; all three return 200 on their health/home routes.

---

## System-Wide Impact

- **Interaction graph:** `apps/web` and `apps/admin` communicate with `apps/api` exclusively over HTTP. No shared DB connections from Next.js apps. `apps/api` is the single source of truth for all mutable state.
- **Error propagation:** API errors bubble as JSON `{ code, message, details? }`. Next.js apps handle HTTP error status codes — 401 redirects to login, 422 surfaces field errors, 5xx shows generic error state.
- **State lifecycle risks:** Settings table has exactly one row — application logic must upsert, not insert. Blog draft state (draft/published) must not be publicly readable; `GET /api/v1/blog` only returns `status: "published"` posts; admin endpoint returns all.
- **API surface parity:** MCP tools (Unit 3.4) must stay in sync with REST routes (Unit 3.2) — when a new field is added to a REST resource, the corresponding MCP tool schema must be updated in the same commit.
- **Integration coverage:** The full create-blog-post flow (admin form → API → DB → MCP tool → web page) is the primary integration path and must be tested end-to-end, not just unit-by-unit.
- **Unchanged invariants:** `packages/ui` CSS tokens remain the styling contract between web and admin — both apps import `packages/ui/src/tokens.css` and rely on the same CSS var names.

## Risks & Dependencies

| Risk                                                        | Mitigation                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| better-auth Express integration gaps                        | Evaluate before starting Unit 3.3; if adapter is incomplete, fall back to next-auth v5 in Express mode                        |
| apps/admin rewrite is large — risk of broken state mid-work | Delete sections incrementally (one per commit); keep the old nav items as 404 stubs until each new section is ready           |
| brand.config.ts consumed at build time may cause stale CSS  | Use `generateTokens` in server layout (runs per-request in dev; static in prod); document that color changes require redeploy |
| MCP SDK breaking changes                                    | Pin `@modelcontextprotocol/sdk` to specific version; check release notes before starting Unit 3.4                             |
| DB migration 0006 is destructive                            | Run against a dev DB only until tested; add `IF EXISTS` guards; document restore from backup before running in prod           |
| apps/web and apps/admin both need API_URL env var           | Document clearly in README + Makefile; add runtime check in `lib/api.ts` that logs a warning if `API_URL` is missing          |

## Phased Delivery

### Phase 1 — Teardown (Units 1.1–1.2)

Delete everything that's going. CI will be temporarily broken — acceptable. Complete quickly, do not pause between 1.1 and 1.2.

### Phase 2 — Packages (Units 2.1–2.4)

Rebuild the foundation. DB migration, auth, AI slim, brand tokens. No apps yet.

### Phase 3 — API (Units 3.1–3.6)

Build Express API from scratch. All business logic lives here. Self-contained; testable in isolation.

### Phase 4 — Web (Units 4.1–4.5)

Make `apps/web` standalone and complete. All 10 pages, SEO, chatbot.

### Phase 5 — Admin (Units 5.1–5.4)

Rebuild admin as a standalone CMS. Depends on API being ready.

### Phase 6 — Polish (Units 6.1–6.2)

Dark mode finalization, CI cleanup, README.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-23-vision-reset-requirements.md](docs/brainstorms/2026-04-23-vision-reset-requirements.md)
- Current API patterns: `apps/platform-api/src/routes/` (Hono route structure to reference)
- Current MCP tools: `apps/mcp/src/tools/` (tool handler pattern)
- Current auth: `packages/auth/src/` (JWT pattern being replaced by better-auth)
- DB patterns: `packages/db/src/schema/blog.ts`
- External: better-auth Express adapter docs; `@modelcontextprotocol/sdk` Express integration; Next.js 15 `generateMetadata` API; GEO/llms.txt spec
