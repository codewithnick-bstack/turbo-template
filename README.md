# `my-client-websites`

A **Turborepo monorepo starter** for shipping polished client websites quickly.

It includes:

- `apps/web` — **Next.js 15 + App Router** marketing site with Tailwind CSS v4, dark/light mode, MDX blog, portfolio, services, and contact page
- `apps/api` — **Express.js API** with security middleware, rate limiting, health checks, and contact form delivery
- `apps/cron` — **Node cron microservice** for scheduled tasks and IndexNow sitemap submission
- `packages/ui` — shared shadcn-style UI building blocks for future reuse
- `packages/config` and `packages/eslint-config` — shared TypeScript, Tailwind, and ESLint setup

> The web app is intentionally **runtime self-contained** so it can be handed off or deployed independently without coupling to shared workspace code.

---

## Project structure

```txt
my-client-websites/
├── apps/
│   ├── web/
│   ├── api/
│   └── cron/
├── packages/
│   ├── ui/
│   ├── config/
│   └── eslint-config/
├── turbo.json
├── package.json
└── README.md
```

---

## Quick start

### 1) Install dependencies

```bash
pnpm install
```

### 2) Copy env values

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/cron/.env.example apps/cron/.env
```

### 3) Start everything in parallel

```bash
pnpm dev
# or
pnpm turbo run dev
```

This starts:

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Cron worker: scheduled every 30 minutes by default

### Build for production

```bash
pnpm build
```

### Other useful commands

```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

## What’s included

### `apps/web`

- Next.js 15 App Router + React 19
- Mobile-first responsive UI
- Tailwind CSS v4 styling
- shadcn-style components and theme toggle
- Home, About, Services, Portfolio, Blog, Contact pages
- MDX blog with dynamic routes: `/blog/[slug]`
- `loading.tsx`, `not-found.tsx`, metadata, OpenGraph image, `robots.ts`, and `sitemap.ts`
- Framer Motion animations and polished gradients

**Demo content lives in:** `apps/web/lib/site-data.ts`

### `apps/api`

- Express REST API under `/api/*`
- `GET /api/health`
- `POST /api/contact`
- `helmet`, `cors`, `morgan`, `body-parser`, and `express-rate-limit`
- Resend / SMTP / log-only fallback for contact emails
- Exported serverless entry for Vercel in `apps/api/api/index.ts`

### `apps/cron`

- `node-cron` scheduler
- IndexNow sitemap submission every 30 minutes (configurable)
- Detects sitemap changes using a hash file
- Logs to stdout and `logs/indexnow.log`
- Safe dry-run mode when `INDEXNOW_KEY` is not configured

---

## Deployment guide

### Web → Vercel

1. Create a new Vercel project.
2. Set the **root directory** to `apps/web`.
3. Add `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL`.
4. Deploy.

### API → Vercel

1. Create a second Vercel project.
2. Set the **root directory** to `apps/api`.
3. Add API env variables from `apps/api/.env.example`.
4. Deploy — Vercel uses the `api/index.ts` serverless handler.

### Cron → Railway / Render / Docker / PM2

Use `apps/cron/Dockerfile` or run:

```bash
pnpm --filter cron build
pnpm --filter cron start
```

Set:

- `SITEMAP_URL`
- `INDEXNOW_HOST`
- `INDEXNOW_KEY`
- `INDEXNOW_KEY_LOCATION`
- `CRON_SCHEDULE`

---

## Client customization workflow

For a new client, update these first:

1. `apps/web/lib/site-data.ts` — brand name, nav, services, testimonials, projects
2. `apps/web/content/posts/*.mdx` — publish niche-specific articles
3. `apps/web/app/layout.tsx` — metadata and schema defaults
4. `apps/web/app/globals.css` — color mood and theme tokens
5. `apps/api/.env` — contact delivery provider settings

---

## Notes

- Husky pre-commit hooks run `lint-staged`.
- Vitest is configured for API tests.
- Dockerfiles are included for all three apps.
- `packages/ui` is ready for future shared component extraction as your monorepo grows.
