# AI-First Business Website Template

A Turborepo monorepo for a **single-business website** with an AI-powered chatbot, CMS, and MCP agent interface. Clone it, edit `brand.config.ts`, and deploy.

---

## Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| Web frontend | Next.js 15 (App Router, Turbopack)      |
| Admin CMS    | Next.js 15 (App Router, Turbopack)      |
| API          | Express 5 + TypeScript                  |
| Database     | Postgres 16 + Drizzle ORM               |
| Auth         | better-auth (email + password)          |
| AI           | Anthropic Claude (claude-haiku-4-5)     |
| MCP server   | `@modelcontextprotocol/sdk` over HTTP   |
| Styling      | Tailwind CSS v4 + CSS custom properties |
| Monorepo     | Turborepo + pnpm workspaces             |

---

## Repo layout

```
apps/
  web/       Marketing website — Next.js 15, port 3000
  admin/     Content management — Next.js 15, port 4000
  api/       REST API + MCP server — Express 5, port 3001
packages/
  ui/            Shared UI components + brand token generator
  config/        tsconfig + ESLint base configs
  eslint-config/ Shared ESLint rules
  db/            Postgres schema + Drizzle client
  auth/          better-auth configuration wrapper
  ai/            Anthropic model adapter
  observability/ Logger + error taxonomy
infra/
  docker-compose.yml  Local Postgres
  perf-budget.json    CI bundle size limits
docs/
  plans/       Implementation plans
  brainstorms/ Feature requirements docs
  adr/         Architecture Decision Records
```

---

## Quick start

```bash
# 1. Clone
git clone <repo-url> my-site && cd my-site

# 2. Install + setup infra
make setup

# 3. Customize your brand
#    Edit brand.config.ts at the repo root — change business name,
#    colors, fonts, contact info, social links.

# 4. Start all three apps
make dev
```

Apps start at:

- `http://localhost:3000` — website
- `http://localhost:4000` — admin CMS
- `http://localhost:3001` — API (health: `/health`)

---

## Branding

Edit `brand.config.ts` at the repo root:

```ts
const brand: BrandConfig = {
  businessName: "Acme Studio",
  tagline: "We build digital experiences that grow businesses.",
  primaryColor: "#6366f1",
  accentColor: "#8b5cf6",
  fontHeading: "Inter",
  fontBody: "Inter",
  email: "hello@acmestudio.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, San Francisco CA 94105",
  socialLinks: {
    twitter: "https://twitter.com/acmestudio",
    linkedin: "https://linkedin.com/company/acmestudio",
    github: "https://github.com/acmestudio",
  },
};
```

`primaryColor` and `accentColor` are injected as CSS custom properties at build time via `generateTokens()` from `@repo/ui`. Color changes require a redeploy (or `next dev` restart).

---

## Architecture

```
apps/web   ──► apps/api  /api/v1/*  (REST)
apps/admin ──►           /auth/*    (better-auth)
                         /mcp       (MCP over HTTP)
                              │
                    packages/{db,auth,ai,observability}
```

**Constraint:** `apps/web` and `apps/admin` import zero business-logic packages. Only `@repo/ui` (components + tokens) and `@repo/config` (tsconfig/eslint) are shared. All data access, auth, and AI logic live in `apps/api`.

---

## Environment variables

Copy `.env.example` files and fill in values:

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
BETTER_AUTH_SECRET=...
CORS_ORIGIN=http://localhost:3000,http://localhost:4000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# apps/admin/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

---

## API

| Method | Path                   | Auth          | Description                 |
| ------ | ---------------------- | ------------- | --------------------------- |
| GET    | `/health`              | —             | Health check                |
| GET    | `/api/v1/settings`     | —             | Site settings               |
| GET    | `/api/v1/blog`         | —             | Published posts             |
| GET    | `/api/v1/blog/:slug`   | —             | Single post                 |
| GET    | `/api/v1/team`         | —             | Team members                |
| GET    | `/api/v1/testimonials` | —             | Testimonials                |
| GET    | `/api/v1/portfolio`    | —             | Published portfolio entries |
| POST   | `/api/v1/contact`      | —             | Submit contact form         |
| POST   | `/api/v1/chat`         | —             | Chat with site AI           |
| POST   | `/auth/sign-in/email`  | —             | Admin sign in               |
| GET    | `/mcp`                 | Admin session | MCP server (SSE)            |

Admin endpoints (require session cookie) under `/api/v1/{blog,team,testimonials,portfolio,contacts,settings,ai}` expose full CRUD.

---

## MCP

The API exposes an MCP server at `/mcp` (Server-Sent Events transport). Connect Claude Desktop or any MCP client:

```json
{
  "mcpServers": {
    "website": {
      "url": "http://localhost:3001/mcp"
    }
  }
}
```

Available tools mirror the REST API: `create_blog_post`, `update_blog_post`, `list_contacts`, `get_site_settings`, `update_site_settings`, etc.

---

## Deployment

1. Deploy `apps/api` to any Node.js host (Railway, Render, Fly.io). Set `DATABASE_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `BETTER_AUTH_SECRET`.
2. Deploy `apps/web` to Vercel. Set `NEXT_PUBLIC_API_URL` to your API URL.
3. Deploy `apps/admin` to Vercel. Set `NEXT_PUBLIC_API_URL` and `API_URL`.
4. Run `pnpm db:migrate` against your production database.

---

## Make targets

```
make setup      Install deps, copy env files, start Postgres, run migrations
make dev        Start api + web + admin in parallel
make dev-api    Start only api (:3001)
make dev-web    Start only web (:3000)
make dev-admin  Start only admin (:4000)
make typecheck  Type-check all apps and packages
make lint       Lint all apps and packages
make db         Start Postgres via docker compose
make migrate    Run Drizzle migrations
make seed       Seed dev fixtures
make reset      Wipe DB + remigrate + reseed
```
