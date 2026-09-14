---
title: "Vision Reset — AI-First Business Website Template"
type: requirements
status: active
date: 2026-04-23
---

# Vision Reset — AI-First Business Website Template

## Problem Frame

The repo has drifted into a full multi-tenant SaaS platform (16 packages, 6 apps, complex billing/agency/platform layers) when the actual goal is a **single business website template** that any developer can clone, customize, and deploy for a real business in hours — not weeks.

The gap: a dev cloning today gets a website-builder SaaS product, not a website.

## What We're Building

A **production-ready, AI-first business website template** built on Next.js 15 + Turborepo. A developer clones it, edits one config file, and has a complete business website ready to deploy. Non-technical users manage content through a lightweight CMS admin. AI agents can read and update content via MCP.

## Target User

**Primary:** A developer (freelancer, small agency, or in-house dev) building a website for a business — SaaS startup, consultancy, agency, professional services firm. They want a high-quality starting point, not a blank canvas.

**Secondary:** The business owner / marketer who manages the site's content post-launch (blog posts, team bios, testimonials) without touching code.

## Core Requirements

### R1 — Complete website, ready out of the box

All standard business pages included, populated with realistic placeholder content. No blank slates.

Pages:

- `/` — Home (hero, features/services overview, social proof strip, testimonials, CTA)
- `/about` — About (mission/values, story, stats)
- `/services` (or `/products`) — Services/offerings detail
- `/team` — Team members with bios and photos
- `/blog` — Blog index + `/blog/[slug]` — individual posts
- `/testimonials` — Client testimonials
- `/portfolio` (or `/work`) — Case studies / portfolio grid
- `/pricing` — Pricing tiers
- `/contact` — Contact form
- `/status` — Service status page (placeholder)

### R2 — Hybrid content model

**Static (code-driven):** Layout and structure of pages like Home, About, Services, Pricing. Devs edit these in code. Good defaults mean they rarely need to.

**Dynamic (DB-driven via admin):** Blog posts, team members, testimonials, contact form submissions, portfolio entries. Non-devs manage these via the CMS admin panel without touching code.

### R3 — One-file brand customization

A single `brand.config.ts` at the repo root controls:

- Business name, tagline, logo path
- Primary/secondary/accent colors
- Font family choices (heading, body)
- Social links (Twitter/X, LinkedIn, GitHub, Instagram)
- Contact details (email, phone, address)
- Feature flags (show/hide pricing, portfolio, testimonials sections)

CSS design tokens (`packages/ui/src/tokens.css`) derive from this config at build time. Swapping the brand is one file edit + redeploy.

### R4 — AI-first

**Visitor-facing AI chatbot:** floating widget on all public pages. Answers visitor questions about the business grounded in the site's actual content (blog posts, services, team, FAQs). Falls back gracefully when AI is unavailable. Lead capture after N turns.

**Admin AI tools:** generate blog post draft from title + outline; generate meta description from page content.

**Agent-accessible via MCP:** every content operation (read page, create/update blog post, manage team, read contact submissions) exposed as an MCP tool. An AI agent can fully operate the site without using the admin UI.

### R5 — SEO + GEO first-class

**Traditional SEO:**

- Per-page metadata API (`generateMetadata` on every page)
- Auto-generated `sitemap.xml` including all blog posts and dynamic pages
- `robots.txt`
- Dynamic OG image generation (Next.js `opengraph-image.tsx`)
- JSON-LD schema markup: `Organization`, `WebSite`, `Article`, `BreadcrumbList`, `FAQPage` where applicable
- Canonical URLs

**GEO (Generative Engine Optimization):**

- `llms.txt` — structured summary of the business and site content, readable by LLM crawlers (Perplexity, ChatGPT, Gemini)
- `ai.txt` — permissions and guidance for AI agents interacting with the site
- Entity clarity in content: every page clearly identifies who the business is, what it does, who it serves
- AI-parseable FAQ structured data on About and Home

### R6 — Theme system with dark mode

CSS custom properties for all visual tokens: colors, typography scale, spacing, border radius, shadows.

Light/dark mode toggle. System preference respected by default.

Storybook for the design system (`packages/ui`) so devs can see all components at a glance.

### R7 — Simple, secure admin CMS

Single-admin login (email + password; magic link as option). No complex multi-tenancy, no roles, no billing.

Admin sections:

- **Dashboard** — site stats (page views, recent contacts, post count), quick actions
- **Blog** — list, create, edit, publish/draft posts; AI draft generation
- **Team** — CRUD team members (name, bio, photo, title, social links)
- **Testimonials** — CRUD testimonials (name, company, quote, rating, photo)
- **Portfolio** — CRUD portfolio entries (title, client, description, images, tags)
- **Contacts** — inbox of form submissions; mark read/archived
- **Settings** — branding (logo, colors override), site info, SEO defaults, social links

### R8 — Production-grade tooling from day one

- Turborepo monorepo (pnpm workspaces)
- Conventional commits + commitlint
- CI: lint, typecheck, test, build on every PR
- Drizzle ORM + Postgres (Neon-compatible)
- Docker Compose for local dev (Postgres + Redis if needed)
- `Makefile` one-command setup
- Environment variable validation at boot (Zod-based)

## Scope Boundaries

## Architecture Constraint (non-negotiable)

**Next.js apps are standalone UI consumers.** `apps/web` and `apps/admin` import zero business-logic packages from the monorepo (`@repo/db`, `@repo/auth`, `@repo/ai`, etc.). They communicate with the backend exclusively via HTTP fetch calls to `apps/api`.

**API and MCP are co-located in one Express app.** `apps/api` is a single Express server that exposes:

- REST endpoints (CRUD for blog, team, testimonials, portfolio, contact, settings)
- MCP server mounted at `/mcp` (all content operations as agent tools)

`apps/api` is the only app that touches the database, auth session, AI providers, and email.

**Shared only:** `packages/config` (tsconfig + eslint) and `packages/ui` (React components, CSS tokens) may be imported by Next.js apps. Everything else is `apps/api`-only.

This makes each Next.js app independently deployable (Vercel, Netlify, static export) with no monorepo entanglement at runtime.

```
┌─────────────┐   HTTP fetch   ┌──────────────────────────┐
│  apps/web   │ ─────────────► │  apps/api (Express)       │
│ (Next.js)   │                │  • REST /api/v1/*          │
└─────────────┘                │  • MCP   /mcp              │
                                │  • Auth  /auth/*           │
┌─────────────┐   HTTP fetch   │                            │
│  apps/admin │ ─────────────► │  packages/db (Drizzle)     │
│ (Next.js)   │                │  packages/auth             │
└─────────────┘                │  packages/ai               │
                                │  packages/observability    │
                                └──────────────────────────┘
```

### In scope

- `apps/web` — standalone public website (no `@repo/*` business imports)
- `apps/admin` — standalone CMS dashboard (no `@repo/*` business imports)
- `apps/api` — Express: REST API + MCP server combined
- `packages/{ui,db,auth,ai,config,observability}`
- All pages listed under R1
- AI chatbot + admin AI tools
- SEO/GEO setup
- Theme system + dark mode
- Simple email delivery for contact form (Resend, called from `apps/api`)

### Out of scope

- Multi-tenancy (one deployment = one business)
- Stripe billing / subscriptions
- Agency workspace / client management
- Visual page builder / drag-drop editor
- Template marketplace
- Complex RBAC / team permissions
- BullMQ worker — email delivered synchronously from Express route; no queue needed
- Analytics platform (use Vercel Analytics or Plausible script embed)
- Custom domain management API

## Packages to REMOVE

- `packages/billing` — no billing
- `packages/core` — replaced by service modules co-located in `apps/api/src/services/`
- `packages/sdk` — no external SDK consumers
- `packages/schemas` — Zod schemas co-located in `apps/api/src/schemas/`
- `packages/renderer-blocks` — page builder not needed
- `packages/search` — full-text search done in `apps/api` via Postgres `tsvector`
- `packages/flags` — use env vars
- `packages/cli` — out of scope
- `packages/test-utils` — inline in each app

## Apps to REMOVE / MERGE

- `apps/platform-api` — merged into new `apps/api` (Express, simpler)
- `apps/worker` — removed; email is synchronous in Express route
- `apps/mcp` — merged into `apps/api` (mounted at `/mcp`)
- `apps/docs` — deferred; README covers it

## Simplified Final Structure

```
turbo-template/
├── apps/
│   ├── web/       # Standalone Next.js public website (PRIMARY deliverable)
│   ├── admin/     # Standalone Next.js CMS dashboard
│   └── api/       # Express: REST API + MCP server
├── packages/
│   ├── ui/        # Design system, components, Storybook (shared by web + admin)
│   ├── db/        # Drizzle schema + migrations (used by api only)
│   ├── auth/      # Auth wrapper (used by api only)
│   ├── ai/        # LLM adapters + chatbot (used by api only)
│   ├── config/    # TS + ESLint config (shared by all)
│   └── observability/ # Structured logging (used by api only)
├── brand.config.ts   # ONE FILE to customize the whole brand
├── infra/            # docker-compose.yml, Makefile
└── docs/
    ├── adr/
    └── plans/
```

## Success Criteria

1. Dev clones repo, edits `brand.config.ts`, runs `make dev` → complete business website running locally in under 5 minutes
2. AI chatbot answers visitor questions correctly using site content
3. Non-dev edits a blog post in admin → live on site within 30s
4. AI agent (Claude, GPT) can create a blog post via MCP with no UI
5. Lighthouse score ≥ 95 on performance, SEO, accessibility on default content
6. `llms.txt` present and parseable; site surfaces in Perplexity/ChatGPT for business-name queries
7. Zero hardcoded colors, fonts, or business names outside `brand.config.ts`

## Open Questions

### Resolved

- Tenancy model: single-tenant ✓
- CMS model: hybrid (code for layout, DB for dynamic content) ✓
- GEO meaning: Generative Engine Optimization ✓

### Deferred to Planning

- Auth vendor for admin: better-auth vs lucia vs next-auth v5 — decide based on single-user simplicity
- AI provider default: Anthropic claude-haiku-4-5 as default; adapter pattern keeps OpenAI swappable; mock adapter for dev/test
- Chatbot grounding strategy: simple keyword search on cached DB content for MVP; pgvector RAG as optional upgrade path
- Lead capture in chatbot: Phase 2 feature — not in MVP; chatbot gracefully degrades to contact page CTA when AI unavailable
