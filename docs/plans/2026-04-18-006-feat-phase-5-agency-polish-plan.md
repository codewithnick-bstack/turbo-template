---
title: "Phase 5 — Agency Layer + Polish"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 5 — Agency Layer + Polish

## Overview

Unlock agencies and harden the product: agency workspaces with client sub-tenants, white-label branding, first-party template marketplace, Stripe Connect reseller billing, i18n, accessibility baseline, performance pass, design system in `packages/ui` with Storybook + Chromatic.

## Requirements Trace

- R2, R4, R5, R7, R8

## Key Technical Decisions

- Tenant hierarchy: parent→child via `parent_tenant_id`; RLS joins traverse hierarchy
- Agency plan unlocks N client seats
- Stripe Connect type: Express (easiest onboarding)
- i18n: next-intl admin + locale-scoped content entries
- A11y: axe CI gate + manual audit
- Design system: tokens as CSS vars; Storybook deployed; Chromatic PR gate

## Implementation Units

- [ ] **Unit 5.1: Agency workspaces + client seats**

  **Files:** `packages/db/src/schema/tenants.ts` (parent_tenant_id), `packages/core/src/agency/{workspace,client,invite}.ts`, `apps/admin/app/(dashboard)/agency/*`
  **Test scenarios:** agency creates client tenant + invites (happy); client cannot see sibling (error); client cannot sub-nest (edge); billing rollup toggle (integration); remove-agency path (edge).

- [ ] **Unit 5.2: White-label branding**

  **Files:** `packages/core/src/whitelabel/{theme,domain,email}.ts`, admin theme context
  **Test scenarios:** agency logo on client login (happy); default fallback (edge); SPF/DKIM verified (integration); unverified domain blocks email WL (error).

- [ ] **Unit 5.3: Template marketplace v1 (first-party)**

  **Files:** `packages/core/src/templates/{catalog,clone}.ts`, `apps/admin/app/(dashboard)/templates/*`, `seeds/templates/{legal,wellness,fitness,consulting}/*`
  **Test scenarios:** clone Legal (happy); dependency gated on plan (edge); cloned site renders clean (integration).

- [ ] **Unit 5.4: Reseller billing (Stripe Connect)**

  **Files:** `packages/billing/src/reseller/{connect,markup,payout}.ts`, `apps/admin/app/(dashboard)/agency/billing/*`
  **Test scenarios:** 20% markup → client pays → payout minus fee (happy); Connect incomplete blocks billing (error); refund split correctly (edge); Stripe Tax by jurisdiction (integration); past-due gates only that client (edge).

- [ ] **Unit 5.5: i18n (admin + content)**

  **Files:** `apps/admin/messages/{en,es,fr,de}.json`, `packages/schemas/src/page.ts` (locale-aware), `packages/core/src/i18n/{locale,translation}.ts`
  **Test scenarios:** admin locale switch persists (happy); site with EN+ES loads per URL (happy); missing translation falls back with warning (edge); RTL layout flips (integration).

- [ ] **Unit 5.6: Accessibility baseline (WCAG 2.2 AA)**

  **Files:** admin components keyboard+ARIA, `packages/test-utils/src/a11y.ts`, CI axe job
  **Test scenarios:** axe CI zero violations on admin key screens (happy); builder fully keyboard-operable (happy); custom theme contrast flagged (edge); every marketing block clean (integration).

- [ ] **Unit 5.7: `packages/ui` design system + Storybook + Chromatic**

  **Files:** `packages/ui/src/{tokens,components/*,storybook}`, `packages/ui/.storybook/*`
  **Test scenarios:** all components render in SB (happy); Chromatic diff baseline (integration); dark+light snapshots (edge).

- [ ] **Unit 5.8: Performance pass (CWV ≥ Good at p75)**

  **Files:** bundle analyzer config, `infra/perf-budget.json`, RSC boundary refactors, priority hints
  **Test scenarios:** Lighthouse median ≥ 95 (happy); 3G throttled LCP < 4s (edge); PR gate fails on budget bust (integration).

## Verification Gate

- First agency onboards 10+ clients end to end
- Storybook deployed; Chromatic green
- axe CI zero violations; manual a11y audit scheduled
- RUM shows p75 CWV ≥ Good across surfaces
