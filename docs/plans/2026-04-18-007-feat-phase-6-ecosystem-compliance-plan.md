---
title: "Phase 6 — Ecosystem, Compliance, Docs, GTM"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 6 — Ecosystem, Compliance, Docs, GTM

## Overview

Open the platform: public docs site (OpenAPI + MCP + SDK reference), CLI for local dev loops, per-tenant sandbox environments, SOC 2 Type II readiness + GDPR/CCPA self-service, SLO-driven observability v2, OAuth app platform for partners, GTM (pricing page + status page + support).

## Requirements Trace

- R3 Agent parity (OAuth apps, sandbox)
- R8 Infra (SLOs, compliance)
- R9 DX (docs, CLI, sandbox)

## Key Technical Decisions

- Docs engine: Nextra (Next.js native, MDX-first)
- CLI: commander + device-code OAuth; wraps `@repo/sdk`
- Sandbox: copy-on-write at content layer; promote = diff+apply
- Compliance vendor: Vanta or Drata for evidence collection
- Telemetry vendor: Grafana Cloud vs Datadog — decided at start of Phase 6
- OAuth: code + PKCE; scopes map to entitlements

## Implementation Units

- [x] **Unit 6.1: `apps/docs` (Nextra) with generated reference**

  **Files:** `apps/docs/**`, `scripts/generate-reference.ts`
  **Test scenarios:** reference rebuilds on schema change (integration); code samples executed in CI (integration); docs search returns results (happy).

- [x] **Unit 6.2: CLI (`packages/cli` → published `@repo/cli`)**

  **Files:** `packages/cli/**`
  **Test scenarios:** device-flow login (happy); `pull content` downloads entries (happy); auth expiry prompts re-login (error); all commands routed through SDK (integration).

- [x] **Unit 6.3: Sandbox environments**

  **Files:** `packages/core/src/environments/{branch,merge,promote}.ts`
  **Test scenarios:** create sandbox → agent edits → merge (happy); conflict UI (edge); forbidden change blocked on merge (error).

- [x] **Unit 6.4: Compliance — SOC 2 + GDPR/CCPA tooling**

  **Files:** `packages/core/src/compliance/{export,delete,consent}.ts`, `apps/admin/app/(dashboard)/settings/{privacy,security}/*`, runbooks
  **Test scenarios:** DSR export in ≤ 24h (happy); DSR delete anonymizes analytics (happy); audit log → SIEM (integration); backup restore rehearsal (integration, RPO ≤ 1h, RTO ≤ 4h); monthly access review artifact (integration).

- [x] **Unit 6.5: Observability v2 — SLOs, dashboards, on-call**

  **Files:** `infra/slo/*.yml`, Grafana dashboards, runbooks
  **Test scenarios:** injected failure pages on-call in ≤ 2 min (integration); SLO burn visible (happy); alert flap suppression (edge).

- [x] **Unit 6.6: Developer platform — OAuth apps + scoped tokens + partner directory**

  **Files:** `packages/core/src/oauth/{app,grant,scope}.ts`, `apps/admin/app/(dashboard)/settings/developers/*`, `apps/docs/directory`
  **Test scenarios:** code+PKCE flow (happy); invalid scope rejected (error); token revocation invalidates (edge); scoped token read but not write (integration).

- [x] **Unit 6.7: GTM — pricing page + status page + support**

  **Files:** public marketing section, Statuspage.io integration, support widget
  **Test scenarios:** pricing renders from Stripe (happy); status auto-updates from synthetic checks (integration); support widget deep-links (edge).

## Verification Gate

- SOC 2 Type II observation window closed; auditor sign-off
- External partner app live via OAuth
- Docs DAU > 200
- SLO dashboards live; on-call rotation active
