# ADR 0006: Auth Provider Adapter

- **Status:** Superseded (2026-04-24 — website template uses better-auth with email+password, not WorkOS/Clerk; the B2B multi-tenant auth described here is not applicable)
- **Date:** 2026-04-18

## Context

Multi-tenant B2B auth needs SSO, SCIM, role/permissions, organization switching, invite flows, and SOC 2 evidence. Building this in-house costs months.

## Decision

Use a hosted provider (**WorkOS** or **Clerk B2B**) behind a thin adapter in `packages/auth` so the decision is reversible.

Selection pending pricing + SCIM coverage review in Phase 1 (Unit 1.2). Default assumption: WorkOS for enterprise SSO breadth; Clerk if DX wins in a spike.

## Consequences

- Months saved; compliance posture inherited
- Vendor cost grows with seats; mitigated by negotiated pricing tiers
- Adapter abstraction means a 1–2 week migration if the decision reverses

## Alternatives Considered

- **Roll our own with NextAuth + custom org model** — rejected: SSO, SCIM, audit trails are nontrivial
- **Supabase Auth** — weak B2B org primitives
- **Ory Kratos/Hydra** — powerful, but ops-heavy
