# Semantic Search — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 4

## Problem

Visitors hit "search" expecting Google-grade relevance. Editors need admin-side search across content, media, and settings. Both must be fast, typo-tolerant, and cheap.

## Decision tree

- v1: Postgres `tsvector` (BM25) + `pgvector` (cosine over embeddings) + reciprocal rank fusion
- v2 (if scale demands): Typesense (keyword) or Turbopuffer (vector) — migrate only if v1 p95 > 150ms at 10M documents

## Index shape

Entity → document:

- Page: title, blocks flattened to text, URL, site
- Content entry: all string fields, collection name
- Blog post: title, body, tags
- Media: filename, alt text, user tags

Embeddings from Voyage AI or Cohere. Recompute on publish via worker job.

## Open questions

- Multi-tenant: one global index with `tenant_id` filter or per-tenant indexes?
- Embeddings cost per tenant — cap and degrade to BM25 when exceeded?
- Search analytics: capture queries with opt-in?
- Admin search ranks differently from visitor search?

## Success metrics

- NDCG@5 ≥ 0.75 on blind eval set
- Query p95 < 150ms
- Reindex latency after publish < 60s
