---
title: "Phase 2 — Visual Builder, CMS, Media, MCP, Webhooks"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 2 — Visual Builder, CMS, Media, MCP, Webhooks

## Overview

Turn data CRUD into an authoring experience. Block-based content model, visual builder in `apps/admin`, media pipeline on R2, headless CMS collections, publishing with on-demand ISR, BullMQ worker replacing cron, MCP server at parity with Phase 1+2 operations, and webhook fabric.

## Requirements Trace

- R3 Agent parity (MCP + parity lint)
- R4 Great UI/UX (builder)
- R5 Customer features (CMS, media, publishing)
- R8 Infra (worker, ISR)

## Scope Boundaries

- No AI features (Phase 4)
- No billing (Phase 3)
- No agency features (Phase 5)
- No i18n (Phase 5)

## Key Technical Decisions

- Block shape: structural JSON blocks + Portable Text for rich-text fields (see brainstorm)
- Builder state: Zustand + dnd-kit + optimistic mutations
- Worker: BullMQ on Upstash Redis
- MCP transport: HTTP + stdio adapters; device-flow OAuth for human agents, API keys for M2M
- Webhook signatures: HMAC SHA256, per-subscription secrets

## Implementation Units

- [ ] **Unit 2.1: Block schemas + renderer-blocks package**

  **Files:** `packages/schemas/src/blocks/{hero,features,cta,testimonials,richtext,form,custom,index}.ts`, `packages/renderer-blocks/src/blocks/*.tsx`, `apps/web/app/[...slug]/page.tsx`
  **Approach:** migrate `apps/web/components/hero-section.tsx` etc. into `packages/renderer-blocks`; seed DB with current marketing home as block tree.
  **Test scenarios:** render equivalence with current site (snapshot); unknown block fallback (error); nested children (edge); seed round-trip (integration).

- [ ] **Unit 2.2: Visual page builder in `apps/admin`**

  **Files:** `apps/admin/app/(dashboard)/sites/[siteId]/pages/[pageId]/builder/page.tsx`, `apps/admin/components/builder/*`, `packages/core/src/pages/{autosave,history}.ts`
  **Execution note:** Test-first on the history reducer.
  **Test scenarios:** add/edit/save/reload (happy); autosave debounced (edge); offline queue+replay (error); undo restores deletes (integration); concurrent edits last-writer-wins toast (edge).

- [ ] **Unit 2.3: Media pipeline on R2**

  **Files:** `packages/core/src/media/{upload,transform,serve}.ts`, `apps/admin/components/media/*`, `apps/worker/src/jobs/media-transform.ts`
  **Test scenarios:** 4MB upload → variants (happy); oversized rejected (error); dedupe by content-hash (edge); focal point in URL (integration); corrupt file surfaces error (error).

- [ ] **Unit 2.4: CMS collections + entries**

  **Files:** `packages/core/src/content/{collections,entries,fields}.ts`, `apps/admin/app/(dashboard)/sites/[siteId]/content/*`
  **Test scenarios:** define collection → add entry → render (happy); invalid field rejected (error); deleted reference tombstone (edge); schema change validates existing entries (integration).

- [ ] **Unit 2.5: Publishing + ISR revalidation**

  **Files:** `apps/worker/src/jobs/revalidate.ts`, `apps/web/app/api/revalidate/route.ts`
  **Test scenarios:** publish → live in < 5s (happy); preview URL token-gated (happy); retry on failure 3× (error); concurrent publishes queued (edge).

- [ ] **Unit 2.6: `apps/worker` (BullMQ) + deprecate `apps/cron`**

  **Files:** `apps/worker/src/{server,queues,jobs/*,index}.ts`
  **Test scenarios:** enqueue + execute (happy); retry on transient (error); DLQ on permanent (error); idempotency by jobId (edge); IndexNow parity with cron (integration).

- [ ] **Unit 2.7: `apps/mcp` + parity lint**

  **Files:** `apps/mcp/src/{server,tools/*,auth,index}.ts`, `packages/schemas/src/mcp/manifest.ts`, `scripts/verify-parity.ts`
  **Execution note:** Write parity lint first — CI fails until compliant.
  **Test scenarios:** agent calls `create_site` → DB + admin (happy); unauthed tool returns MCP error (error); invalid params structured error (edge); update emits same audit+webhook as UI (integration); parity lint passes (integration); rate limit per agent (error).

- [ ] **Unit 2.8: Webhook fabric**

  **Files:** `packages/core/src/webhooks/{subscriptions,deliver,sign}.ts`, `apps/worker/src/jobs/webhook-deliver.ts`, `apps/admin/app/(dashboard)/settings/webhooks/*`
  **Test scenarios:** delivered with signature (happy); retry + give up after 6 (error); filter by event type (edge); delivery log in admin + API + MCP (integration); replay 48h (edge).

## Verification Gate

- Internal dogfood: marketing home rebuilt via builder only, no code edits
- Agent (via MCP) builds a demo site end-to-end with zero UI clicks
- BullBoard shows live queues; IndexNow parity preserved
