# ADR 0005: Agent Parity Invariant

- **Status:** Superseded (2026-04-24 — this ADR described the multi-tenant platform template; the website template uses a simpler model where `apps/api` serves both HTTP and MCP, without `platform-api`, `mcp`, or `verify-parity.ts`)
- **Date:** 2026-04-18

## Context

Our wedge is agent-native. Every feature the UI can do, an agent must be able to do. Historically, retrofit MCP support lags the UI by months and accretes feature gaps.

## Decision

**Parity invariant:** for every state-changing operation `X`, all five must exist before the feature can merge:

1. Service function `packages/core/<domain>/X.ts`
2. HTTP handler in `apps/platform-api` that calls the service
3. MCP tool in `apps/mcp` that calls the same service
4. Webhook event emitted (`<domain>.<verb>`) where the change is observable
5. Audit-log row with actor, tenant, changes

Read operations require at minimum (1), (2), (3).

Enforced by `scripts/verify-parity.ts` in CI (Unit 2.7 in roadmap).

## Consequences

- Agents, partners, and internal tools all get new capabilities on day one
- Webhooks become the default integration surface for third parties
- Trade-off: cost per feature is higher; offset by codegen from `packages/schemas`

## Alternatives Considered

- **"Agents use the public API"** — too slow for interactive copilots; poor error taxonomy
- **"Add MCP at end of milestone"** — invariably skipped under schedule pressure
