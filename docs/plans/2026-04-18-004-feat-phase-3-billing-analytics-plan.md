---
title: "Phase 3 — Billing, Forms, Analytics, Blog Migration, Legacy Sunset"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 3 — Billing, Forms, Analytics, Blog Migration, Legacy Sunset

## Overview

Make the platform a business: Stripe Billing + entitlements gating features and limits, real form submissions + AI spam control, first-party analytics + A/B, MDX blog migrated into CMS, and legacy `apps/api` + `apps/cron` removed.

## Requirements Trace

- R2 Both personas (plans, seats)
- R5 Customer features (forms, analytics, blog)
- R6 AI features (basic lead scoring)
- R7 Agency features (foundation for Phase 5 reseller)
- R10 Migration-safe (legacy removal)

## Key Technical Decisions

- Billing provider: Stripe Billing + Tax; Connect deferred to Phase 5
- Plans: Starter, Pro, Agency. Limits = sites, seats, form submissions/mo, AI tokens/mo
- Entitlement checks live at service boundary, not handler — easier to enforce in MCP + API identically
- Analytics: self-hosted first-party ingest; nightly roll-ups; PostHog-compatible event shape
- Spam: Turnstile + simple AI heuristic (graduates in Phase 4)

## Implementation Units

- [x] **Unit 3.1: Billing + entitlements (`packages/billing`)**

  **Files:** `packages/billing/src/{stripe,plans,entitlements,usage,index}.ts`, `packages/core/src/billing/checks.ts`, `apps/admin/app/(dashboard)/settings/billing/*`
  **Test scenarios:** upgrade Starter→Pro reflects in ≤ 30s (happy); seat overflow blocks invite with upgrade CTA (error); downgrade archives excess sites (edge); Stripe webhook retry (integration); past_due read-only mode (edge); usage metering per form+AI (integration).

- [ ] **Unit 3.2: Forms + lead intelligence (basic)**

  **Files:** `packages/core/src/forms/{schema,submit,spam,deliver}.ts`, `apps/admin/app/(dashboard)/sites/[siteId]/forms/*`
  **Test scenarios:** submit → inbox + email + webhook (happy); Turnstile blocks bot (error); dedupe within 60s (edge); attach to block via builder (integration).

- [x] **Unit 3.3: Analytics + A/B testing**

  **Files:** `packages/core/src/analytics/{ingest,report,experiments}.ts`, `apps/admin/app/(dashboard)/sites/[siteId]/analytics/*`, `apps/web` client snippet
  **Test scenarios:** pageview → dashboard in ≤ 60s (happy); DNT honored (edge); A/B 50/50 sticky-by-session (integration); invalid payload rejected (error); IP truncated (edge, GDPR).

- [ ] **Unit 3.4: Blog migrated into CMS**

  **Files:** `packages/core/src/blog/{post,category,tag}.ts`, importer script, `apps/web/app/blog/*`
  **Test scenarios:** existing MDX URLs preserved (happy); frontmatter preserved (edge); publish triggers revalidation (integration); unmigrated → Sentry (error).

- [x] **Unit 3.5: Sunset `apps/api` + `apps/cron`**

  **Files:** delete both apps, update `turbo.json`, `pnpm-workspace.yaml`, `README.md`, deployment docs
  **Execution note:** require 30 days zero-traffic before delete.
  **Test scenarios:** PR rejected if traffic seen in last 7d (integration); forms still delivered (integration).

- [ ] **Unit 3.6: Onboarding wizard**

  **Files:** `apps/admin/app/(onboarding)/*`, `packages/core/src/onboarding/{progress,checklist}.ts`
  **Test scenarios:** signup → publish in ≤ 5 min p50 (happy); skip + resume (edge); funnel events per step (integration); domain step failure offers skip (error).

## Verification Gate

- 10 paying tenants in Stripe test mode
- Blog URLs stable; no 404s
- Legacy apps removed; prod traffic report shows platform-api only
