# Visitor-Facing AI Chatbot — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 4

## Problem

Visitors arriving on a customer site want quick answers. Owners want leads, not a front-desk conversation. The chatbot must be grounded (no hallucination) and honest about its limits.

## Must-haves

- RAG over site content (pages, blog, FAQs, collections)
- Cited sources visible in chat
- Lead capture after N turns or on-demand
- Configurable persona + tone (tokens from site brand)
- Rate-limited per visitor session
- Zero setup for basic grounding; advanced: upload PDFs

## Anti-features (v1)

- No transactional actions (no appointment booking, no purchases). Deep link only.
- No memory across sessions beyond lead capture
- No multi-site grounding (one site at a time)

## Open questions

- On-page position: floating bubble default, block-placeable alternative
- How do we detect "should capture lead now"? (Heuristic vs model-scored)
- GDPR: do we count chat transcripts as personal data? (Yes, treat as such)
- Plan gating: included free vs AI add-on?

## Success metrics

- ≥ 80% grounded answers on blind eval
- ≥ 10% chat→lead conversion on demo sites after 2 weeks
- Latency p95 < 2.5s to first token
