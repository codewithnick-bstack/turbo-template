# Builder Data Model — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 2

## Problem

What's the canonical in-database shape of a page? Choice constrains the builder UX, the renderer, the agent tool surface, and five years of data migrations.

## Options

### Option A: Blocks-as-JSON

```json
{
  "blocks": [
    { "id": "b1", "type": "hero", "props": { "title": "..." } },
    { "id": "b2", "type": "features", "props": { "items": [...] } }
  ]
}
```

- Pros: simple, easy to render, easy for agents to reason about
- Cons: nested blocks get awkward; rich-text fields need their own format

### Option B: Portable Text (Sanity-style)

- Pros: mature schema for rich text + embeds; separation of structural vs inline
- Cons: two mental models (page = structural, rich text = portable text)

### Option C: Lexical / ProseMirror tree

- Pros: reuses editor tree for content model
- Cons: editor-framework lock-in; less natural for structural blocks

## Recommendation

**A for structural** + **Portable Text for rich text fields inside blocks**. Agents see blocks; editors see rich text; renderer composes both.

## Open questions

- Versioning: per-page schema version + migration functions?
- Shared blocks / symbols (edit once, reuse many)?
- Conditional rendering (show-if) primitives?
- Dynamic content (CMS collection query inside a block) — materialized at render or client-time?

## Ready-for-plan checklist

- [ ] Block JSON schema locked
- [ ] Rich-text format locked (Portable Text likely)
- [ ] Migration strategy for schema version bumps
- [ ] Agent tool shape reviewed for MCP ergonomics
