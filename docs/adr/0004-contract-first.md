# ADR 0004: Contract-First Schemas

- **Status:** Accepted
- **Date:** 2026-04-18

## Context

Three public surfaces (HTTP API, MCP tools, TypeScript SDK) plus two internal (tRPC admin, webhook payloads) must describe the same entities. Hand-writing five copies rots.

## Decision

**Zod schemas in `packages/schemas` are the single source of truth.** From them we generate:

- OpenAPI JSON (served at `/openapi.json` and committed under `packages/sdk/generated/`)
- MCP manifest (tools + shapes)
- TypeScript SDK (`packages/sdk`) via `openapi-ts`
- Webhook payload types
- Docs site reference pages (`apps/docs`)

Hand-rolled types for these surfaces are banned by lint rule.

## Consequences

- A schema edit regenerates all surfaces; contract tests catch drift
- Agent tool descriptions stay in sync with API reality automatically
- Trade-off: generation tooling is a dependency; offset by CI that blocks on drift

## Alternatives Considered

- **GraphQL** — overkill for REST-shaped content operations; would force another schema source
- **Protobuf** — strong, but weaker web-ecosystem ergonomics for our 2026 TS-heavy stack
