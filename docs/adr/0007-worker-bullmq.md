# ADR 0007: BullMQ Worker Replaces node-cron

- **Status:** Superseded (2026-04-24 — neither `apps/worker` nor `apps/cron` exist in the website template; background jobs are out of scope for this use case)
- **Date:** 2026-04-18

## Context

`apps/cron` today runs `node-cron` in a single process with no retries, no concurrency control, no DLQ. We need revalidation, media transforms, AI jobs, webhook delivery, and scheduled tasks with production-grade reliability.

## Decision

Introduce `apps/worker` using **BullMQ** on Upstash Redis (managed). Queues per domain (revalidate, media, ai, webhook, email, indexnow). Scheduled jobs use BullMQ repeatable jobs, replacing node-cron.

Observability: BullBoard gated behind admin auth; OTEL spans per job.

## Consequences

- Retries, backoff, idempotency keys, DLQ out of the box
- `apps/cron` deprecated and removed in Phase 3 (Unit 3.5)
- Trade-off: Redis is a new failure surface; mitigated by managed Upstash + health checks

## Alternatives Considered

- **Inngest** — great DX, hosted; re-evaluate at Phase 2 if self-hosted cost grows
- **Temporal** — overkill for our workload
- **pg-boss** — viable; rejected in favor of richer BullMQ UI + rate-limiting primitives
