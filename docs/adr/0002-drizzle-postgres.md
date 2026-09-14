# ADR 0002: Postgres + Drizzle ORM

- **Status:** Accepted
- **Date:** 2026-04-18

## Context

We need a relational store with rich query power, multi-tenant row-level security, vector extensions for search/AI, and strong TypeScript ergonomics. Agent tools must reflect the same type shape as the UI.

## Decision

Use **Postgres** as the primary store (Neon preferred for dev branching; Supabase acceptable). Use **Drizzle ORM** for schema definition, queries, and migrations.

Enable extensions from day one: `pgcrypto`, `pg_trgm`, `pgvector`.

Row-level security policies enforce tenant isolation at the database layer; handlers may not bypass via service role except in explicit admin tooling.

## Consequences

- Schema and TypeScript stay in lockstep
- RLS provides a safety net for handler bugs
- pgvector covers semantic search without adding a separate search stack for v1
- Trade-off: Drizzle is younger than Prisma; mitigated by its smaller API surface

## Alternatives Considered

- **Prisma** — heavier runtime, schema language outside TS, slower migrations
- **Kysely** — excellent typing but leaves schema/migrations hand-rolled
- **Raw SQL + zod** — rejected for team velocity
