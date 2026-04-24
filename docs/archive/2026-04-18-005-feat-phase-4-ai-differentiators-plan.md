---
title: "Phase 4 — AI Differentiators"
type: feat
status: active
date: 2026-04-18
origin: docs/plans/2026-04-18-001-feat-agent-native-platform-roadmap-plan.md
---

# Phase 4 — AI Differentiators

## Overview

Ship the AI layer that makes the platform "best in niche": admin copilot that operates the platform via MCP tools, visitor-facing chatbot grounded in site content, one-click content generation, semantic search, SEO autopilot. All built on a shared `packages/ai` adapter with eval harness and per-tenant token metering.

## Requirements Trace

- R3 Agent parity (copilot reuses MCP)
- R6 AI differentiators (all five capabilities)

## Key Technical Decisions

- Model strategy: single provider (Anthropic) as default with OpenAI fallback via adapter
- Grounding: pgvector on site content, BM25 hybrid, per-tenant index
- Eval harness: golden set + LLM-as-judge scored in CI
- Token budget: per-tenant plan cap + hard spend alert; flags gate expensive features
- Copilot trust model: sandbox by default; promote on approve; audit log with `actor=copilot`

## Implementation Units

- [x] **Unit 4.1: `packages/ai` adapter + eval harness**

  **Files:** `packages/ai/src/{adapters/*,prompts,eval,usage,index}.ts`, `packages/ai/evals/*.json`
  **Test scenarios:** typed response per provider (happy); timeout fallback (error); usage metered (integration); eval golden set baseline (integration); cost cap → `quota_exhausted` (error).

- [x] **Unit 4.2: Admin AI copilot**

  **Files:** `apps/admin/app/(dashboard)/sites/[siteId]/assistant/*`, `packages/ai/src/agents/site-copilot.ts`
  **Test scenarios:** "change hero to X" diff → apply (happy); ambiguous prompts clarify (edge); destructive op requires confirm (edge); audit log attribution (integration); tool failure retry (error).

- [x] **Unit 4.3: Visitor chatbot block**

  **Files:** `packages/renderer-blocks/src/blocks/chatbot.tsx`, `packages/core/src/ai/chatbot/{session,rag}.ts`
  **Test scenarios:** grounded answer cites source (happy); out-of-scope fallback (edge); model failure → form CTA (error); captured leads → inbox (integration); per-session rate limit (edge).

- [x] **Unit 4.4: AI content generation**

  **Files:** `packages/ai/src/generators/{blog,section,alt}.ts`, inspector affordance
  **Test scenarios:** generate blog draft (happy); regenerate merges with edits (edge); blocked content filtered (error); usage metered (integration).

- [x] **Unit 4.5: Semantic search**

  **Files:** `packages/search/src/{index,query,vector,hybrid}.ts`, `packages/renderer-blocks/src/blocks/search.tsx`, `apps/worker/src/jobs/reindex.ts`
  **Test scenarios:** relevant result with snippet + score (happy); typo tolerated via vector (edge); empty query graceful (error); reindex on publish < 60s (integration); tenant-scoped admin search (edge).

- [x] **Unit 4.6: SEO autopilot**

  **Files:** `packages/core/src/seo/{audit,suggest,apply}.ts`, `apps/admin/app/(dashboard)/sites/[siteId]/seo/*`
  **Test scenarios:** audit finds missing alt text → suggest → apply (happy); design-breaking suggestion flagged (edge); history visible (integration); Lighthouse crash → partial audit (error).

## Verification Gate

- Copilot user study: 10 tasks complete by copilot-only in ≤ 30 min
- Chatbot: 20 scripted Qs with ≥ 80% grounded citations
- Search NDCG@5 ≥ 0.75 on blind eval
- SEO autopilot: Lighthouse +8 points on demo site
- Eval harness green in CI; no regression on golden set
