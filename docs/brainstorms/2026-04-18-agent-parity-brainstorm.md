# Agent Parity Enforcement — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 2 (lint), ongoing

## Problem

The parity invariant (ADR 0005) is our wedge. Without mechanical enforcement it drifts: one PR ships UI-only, the next ships API-only, and six months later half of features are agent-unreachable.

## Enforcement surface

- Lint script `scripts/verify-parity.ts`
- CI job required on PR
- Pre-commit warning (non-blocking)
- ADR 0005 text in PR template

## Detection rules

For every exported function in `packages/core/*/`, confirm:

1. It has a matching HTTP route in `apps/platform-api` (tagged by convention or metadata)
2. It has a matching MCP tool in `apps/mcp`
3. If it emits state changes, it emits a matching audit log + webhook event

How do we find "matching" without false positives?

- Option A: explicit annotation `/** @parity route=POST /sites, mcp=create_site */`
- Option B: metadata object exported alongside (`export const createSiteContract = { ... }`)
- Option C: file-naming convention (fragile)

Lean toward **B** — discoverable, typecheckable, ignorable when genuinely not applicable.

## Exceptions

Some operations are UI-only by nature:

- Keyboard shortcuts
- Drag-drop affordances
- Local preview state

Mark with `@parity-exempt: <reason>`. Lint checks exempt list stays < N% of operations.

## Open questions

- How to handle batch operations (MCP exposes as one tool, UI exposes as multi-select)?
- How to version MCP tools when a service signature changes?
- How to surface parity gaps to PR author without being noisy?

## Ready-for-plan checklist

- [ ] Annotation shape decided
- [ ] Exception policy documented
- [ ] Sample core service + route + tool + test demonstrated end to end
- [ ] Lint-rule prototype runs in < 5s
