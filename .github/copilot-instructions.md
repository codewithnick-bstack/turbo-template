# GitHub Copilot Instructions

This repository is a **pnpm + Turborepo** starter for building client websites quickly.

## Project structure

- `apps/web` — Next.js 15 App Router marketing site
- `apps/api` — Express.js REST API
- `apps/cron` — Node.js cron microservice for IndexNow and scheduled jobs
- `packages/ui` — shared UI primitives
- `packages/config` / `packages/eslint-config` — shared config packages

## Working rules

- Use **TypeScript everywhere**.
- Use **pnpm** for package management and **turbo** for workspace tasks.
- Prefer small, focused changes that preserve the monorepo structure.
- Do **not** edit generated output such as `dist/`, `.next/`, or coverage artifacts.
- Keep the UI **mobile-first**, accessible, and visually polished.
- Prefer Tailwind CSS v4 utility patterns and shadcn-style component structure.

## App-specific guidance

### `apps/web`
- Keep the site production-ready and easy to customize for new clients.
- Prefer App Router patterns, server components where appropriate, and clean metadata.
- For content swaps, start with `apps/web/lib/site-data.ts` and `apps/web/content/posts/`.
- Avoid unnecessary runtime coupling to shared packages unless explicitly requested.

### `apps/api`
- Keep the backend lightweight and framework-minimal.
- Validate inputs with `zod`.
- Preserve security middleware such as `helmet`, `cors`, rate limiting, and logging.
- Keep routes under `/api/*`.

### `apps/cron`
- Keep scheduled jobs isolated and resilient.
- Use clear logging and safe fallbacks when env vars are missing.
- Preserve dry-run behavior when IndexNow credentials are not configured.

## Verification

After meaningful code changes, verify with:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm lint
```

Do not claim success unless the relevant command has been run and passed.
