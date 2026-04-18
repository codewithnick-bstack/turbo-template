# Infra

Local infrastructure and IaC scaffolding.

## Local dev

```bash
docker compose -f infra/docker-compose.yml up -d
```

Services:

- Postgres 16 at `localhost:5432` (user/pass: `postgres/postgres`, db: `platform_dev`)
- Redis 7 at `localhost:6379`
- MinIO (S3-compatible) at `localhost:9000` (console `localhost:9001`, `minioadmin/minioadmin`)

Then:

```bash
pnpm -F @repo/db db:generate   # generate migration SQL from drizzle schema
pnpm -F @repo/db db:migrate    # apply migrations
pnpm -F @repo/db db:seed       # insert demo tenant + site + page
```

## Production infra

Terraform/Pulumi modules live under `infra/{aws,cloudflare,vercel}/*` once the first production deploy ships (Phase 1).

## Perf budget

`perf-budget.json` is consumed by CI bundle-analyzer checks (Phase 5 Unit 5.8).

## SLO definitions

`slo/*.yml` live here once Phase 6 Unit 6.5 lands.
