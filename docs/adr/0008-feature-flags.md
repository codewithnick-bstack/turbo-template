# ADR 0008: Feature Flags via OpenFeature

- **Status:** Superseded (2026-04-24 — feature flags not needed for single-tenant website template; use env vars for toggling optional features)
- **Date:** 2026-04-18

## Context

Risky features need dark launches, per-tenant rollouts, and plan-gated availability. We want a vendor-neutral flag interface so we can swap providers if costs change.

## Decision

Use the **OpenFeature SDK** with a pluggable provider. Default provider: **Flipt** (self-hosted, OSS). Consumers depend only on `packages/flags`, which wraps OpenFeature; provider choice is config.

Flag taxonomy:

- `release.*` — temporary, deleted after ramp
- `plan.*` — billing-gated, long-lived
- `experiment.*` — A/B tests, driven by analytics

## Consequences

- Vendor-neutral API
- Plan-gated flags live alongside entitlements (`packages/billing`) with a shared query path
- Trade-off: one more moving piece; offset by dark-launch safety

## Alternatives Considered

- **Statsig** — hosted, good A/B primitives; revisit if Flipt ops overhead grows
- **LaunchDarkly** — enterprise-grade but expensive
- **Hard-coded env flags** — rejected; hot toggles are required
