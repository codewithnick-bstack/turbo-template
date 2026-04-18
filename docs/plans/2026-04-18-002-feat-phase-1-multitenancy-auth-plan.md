---
title: "Phase 1 — Multi-Tenancy, Auth, Primary API Shell"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 1 — Multi-Tenancy, Auth, Primary API Shell

## Overview

Stand up the control plane's spine: Postgres schema for tenants/users/memberships, WorkOS/Clerk adapter, `apps/platform-api` behind Hono, Sites+Pages CRUD, custom-domain flow, generated SDK. At end of phase, an internal user can sign up, create a tenant, add a site, bind a custom domain, and render a page from the DB via `apps/web`.

## Problem Frame

Today content lives in static TypeScript files; there is no notion of a "tenant." Every subsequent phase depends on isolated, authenticated, multi-tenant data.

## Requirements Trace

- R1 Multi-tenant (core isolation)
- R2 Both personas (org + seat model)
- R3 Agent parity (API shape established before MCP layer in Phase 2)
- R8 Infra (custom domains)
- R9 DX (typed SDK + OpenAPI)
- R10 Migration-safe (existing `apps/web` + `apps/api` unchanged through Phase 1)

## Scope Boundaries

- No billing yet (Phase 3)
- No builder UI (Phase 2)
- No media uploads (Phase 2)
- No MCP server (Phase 2)

### Deferred to Separate Tasks

- SCIM provisioning: Phase 5 hardening
- SSO IdP federation for admin: Phase 5

## Context & Research

- Existing: `apps/api/src/app.ts` (Express baseline), `apps/web/middleware.ts` (none — will add), `packages/config` (strict TS).
- External: WorkOS B2B docs, Clerk B2B, Neon branching, Drizzle RLS patterns, Vercel Platforms custom-domain reference.

## Key Technical Decisions

- Auth provider: decide WorkOS vs Clerk B2B after a 2-day spike (Unit 1.2a)
- DB host: Neon (branching for PR previews); fallback Supabase
- API framework: Hono (edge-ready, middleware composable) with tRPC mounted for admin UI
- OpenAPI source: generated from `packages/schemas` via `zod-to-openapi`
- SDK: generated via `openapi-ts`; published privately as `@repo/sdk`

## Open Questions

### Resolved During Planning

- Auth sessions: stateless JWT (access) + rotating refresh in httpOnly cookie
- Tenant slug uniqueness: global, reserved-word list

### Deferred to Implementation

- JWT lifetime (15 min vs 60 min) — set during Unit 1.2
- Custom-domain TLS provider (Vercel vs Cloudflare for SaaS) — set during Unit 1.5

## Implementation Units

- [ ] **Unit 1.1: Tenant + user + membership schema + RLS**

  **Files:** `packages/db/src/schema/{tenants,users,memberships,api_keys,audit_log}.ts`, `packages/db/migrations/0001_tenancy.sql`, `packages/schemas/src/{tenant,user,membership}.ts`
  **Test scenarios:** create tenant + owner (happy); duplicate slug (error); last owner removal blocked (edge); cross-tenant read blocked by RLS (integration); audit log written on tenant create (integration).
  **Verification:** `psql` session with `SET app.tenant_id` returns only that tenant's rows.

- [ ] **Unit 1.2a: Auth provider spike**

  **Files:** `docs/adr/0006-auth-provider-adapter.md` (promote to Accepted), `scripts/spike/auth-workos.ts`, `scripts/spike/auth-clerk.ts`
  **Outcome:** provider selected; adapter shape locked.

- [ ] **Unit 1.2: `packages/auth` adapter + signup/login/invite flows**

  **Files:** `packages/auth/src/{provider,session,middleware,index}.ts`, `apps/admin/app/(auth)/{login,signup,accept-invite}/page.tsx`
  **Execution note:** Start with Playwright E2E signup → dashboard.
  **Test scenarios:** signup (happy); SSO login mock (happy); invalid token (error); expired session auto-refresh (edge); invite accept creates membership (integration).

- [ ] **Unit 1.3: `apps/platform-api` Hono bootstrap + middleware stack**

  **Files:** `apps/platform-api/src/{server,context,middleware/*,routes/*,trpc/*,index}.ts`
  **Test scenarios:** `/health` (happy); tRPC `whoami` authed (integration); 401 on missing auth (error); rate limit at 100/10min (edge); OTEL span carries tenant_id (integration).

- [ ] **Unit 1.4: Sites + Pages CRUD + publish**

  **Files:** `packages/core/src/sites/*`, `packages/core/src/pages/*`, routes in `apps/platform-api/src/routes/{sites,pages}.ts`, tRPC procedures
  **Test scenarios:** create site + add page + publish (happy); duplicate slug within site (edge); cross-tenant 403 (error); publish writes audit log + emits `page.published` event (integration).

- [ ] **Unit 1.5: Custom-domain flow + renderer host resolution**

  **Files:** `packages/core/src/domains/{bind,verify,release}.ts`, `apps/web/middleware.ts`, `apps/web/app/[...slug]/page.tsx`
  **Test scenarios:** bind + verify (happy); invalid DNS (error); double-bind blocked (edge); unbind falls back to platform subdomain (edge).

- [ ] **Unit 1.6: Generated OpenAPI + `@repo/sdk`**

  **Files:** `packages/sdk/src/{client,generated,index}.ts`, `scripts/generate-sdk.ts`
  **Test scenarios:** typed `sdk.sites.create({...})` compiles (happy); contract test against dev API (integration); removed required field breaks contract (edge).

- [ ] **Unit 1.7: Migrate `apps/api` contact endpoint onto platform (proxy)**

  **Files:** `apps/api/src/app.ts` (proxy), `packages/core/src/forms/submit.ts`
  **Execution note:** Characterization test first.
  **Test scenarios:** existing contract preserved (happy); form appears in admin (integration); same error shape on validation failure (edge).

## Risks & Dependencies

| Risk                            | Mitigation                                            |
| ------------------------------- | ----------------------------------------------------- |
| RLS bugs let cross-tenant reads | Integration tests per-table; pen-test at end of phase |
| WorkOS/Clerk cost at scale      | Adapter abstracts; revisit at Phase 5                 |
| Custom-domain TLS edge cases    | Use provider primitives; runbook before GA            |

## Verification Gate

- Playwright E2E: new tenant → add page → publish → custom-domain URL renders
- Contract tests green (SDK vs API)
- RLS isolation integration tests green
- Legacy `apps/web` contact form still delivers
