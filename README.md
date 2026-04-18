# Agent-Native Website Platform

Turborepo monorepo for a **multi-tenant, agent-native website platform** with an **agency reseller tier**. Serves both self-serve small businesses and agencies operating many client sites.

Every feature must be reachable through **UI, HTTP API, and MCP tools at parity** (ADR 0005).

> Origin: this repo was bootstrapped from a client-website starter (`apps/web`, `apps/api`, `apps/cron`). The 12–18 month roadmap in `docs/plans/` evolves it into the full platform.

---

## Repo layout

```
apps/
  web/            Renderer — Next.js 15 marketing/client-site renderer
  api/            (legacy) Express contact API — deprecated, removed in Phase 3
  cron/           (legacy) node-cron IndexNow — subsumed by apps/worker in Phase 2
  admin/          Authoring UI (Next.js 15)              [scaffolded]
  platform-api/   Primary HTTP + tRPC API (Hono)         [scaffolded]
  worker/         BullMQ worker                          [scaffolded]
  mcp/            MCP server (HTTP tools endpoint)       [scaffolded]
  docs/           Nextra docs site                       [scaffolded]
packages/
  ui/             Shared UI primitives (shadcn-style)
  config/         tsconfig + tailwind + env helpers
  eslint-config/  Shared ESLint config
  schemas/        Zod schemas — single source of truth   [scaffolded]
  core/           Domain services (parity invariant)     [scaffolded]
  db/             Postgres + Drizzle                     [scaffolded]
  sdk/            Typed client for the API               [scaffolded]
  auth/           Auth adapter (WorkOS / Clerk / mock)   [scaffolded]
  billing/        Stripe + entitlements                  [scaffolded]
  ai/             Model adapters + prompts               [scaffolded]
  search/         Hybrid BM25 + vector search            [scaffolded]
  flags/          OpenFeature wrapper                    [scaffolded]
  observability/  Logger, tracer, AppError taxonomy      [scaffolded]
  renderer-blocks/ Page-builder blocks                   [scaffolded]
  test-utils/     Shared fixtures                        [scaffolded]
  cli/            `platform` CLI                         [scaffolded]
infra/            docker-compose for local Postgres + Redis + MinIO, perf budget, SLOs
docs/
  plans/          Roadmap + per-phase plans
  adr/            Architecture Decision Records
  brainstorms/    Feature-level requirements seeds
  runbooks/       On-call playbooks
  solutions/      Institutional memory
scripts/
  verify-parity.ts     CI lint for ADR 0005
  generate-openapi.ts  Stub; full in Phase 1 Unit 1.6
```

---

## Quick start

```bash
pnpm install
cp .env.example .env
cp apps/platform-api/.env.example apps/platform-api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/mcp/.env.example apps/mcp/.env
cp apps/admin/.env.example apps/admin/.env.local
pnpm db:up                 # Postgres + Redis + MinIO via docker compose
pnpm -F @repo/db db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev                   # all apps in parallel
```

Default ports:

| Service       | URL                   |
| ------------- | --------------------- |
| renderer      | http://localhost:3000 |
| admin         | http://localhost:4000 |
| platform-api  | http://localhost:4100 |
| mcp           | http://localhost:4200 |
| docs          | http://localhost:4300 |
| postgres      | localhost:5432        |
| redis         | localhost:6379        |
| minio console | http://localhost:9001 |

Third-party credentials (WorkOS/Clerk, Stripe, Resend, Anthropic, etc.) are optional in dev: apps boot with placeholder-safe defaults and fall back to dry-run or mock behavior until real keys are supplied.

---

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm parity:check
```

---

## Roadmap

Full strategic roadmap: [`docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md`](docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md).

Phase plans:

- [Phase 1 — Multi-tenancy, auth, API shell](docs/plans/2026-04-18-002-feat-phase-1-multitenancy-auth-plan.md)
- [Phase 2 — Builder, CMS, media, MCP, webhooks](docs/plans/2026-04-18-003-feat-phase-2-builder-cms-mcp-plan.md)
- [Phase 3 — Billing, forms, analytics, legacy sunset](docs/plans/2026-04-18-004-feat-phase-3-billing-analytics-plan.md)
- [Phase 4 — AI differentiators](docs/plans/2026-04-18-005-feat-phase-4-ai-differentiators-plan.md)
- [Phase 5 — Agency layer + polish](docs/plans/2026-04-18-006-feat-phase-5-agency-polish-plan.md)
- [Phase 6 — Ecosystem, compliance, GTM](docs/plans/2026-04-18-007-feat-phase-6-ecosystem-compliance-plan.md)

---

## Core principles

- **Agent parity invariant** — ADR 0005. Enforced by `scripts/verify-parity.ts` in CI.
- **Contract-first** — ADR 0004. `packages/schemas` is the single source of truth; OpenAPI, SDK, MCP manifest, and webhook payloads are generated.
- **Tenant isolation at the DB** — Drizzle + Postgres RLS. Handlers cannot bypass.
- **Safe-by-default** — missing third-party creds degrade to dry-run or mock, never crash at boot.
