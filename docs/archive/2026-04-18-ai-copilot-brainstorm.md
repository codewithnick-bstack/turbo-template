# AI Copilot inside Admin — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 4

## Problem

Editors want to "describe the change" instead of clicking. Agencies want to onboard clients in minutes. Small-biz owners want "build me a site" to actually work.

## User scenarios

- Agency staff: "Import copy from this PDF and build a services page"
- Small-biz owner: "Change hero to say X and add a testimonials section"
- Client editor: "Generate 3 blog post ideas for spring campaign"
- All: "Make this page more accessible"

## Interaction shape

- Inline panel in every admin surface, context-aware
- Tool-use transcript visible with approve/reject per destructive action
- Diff view before apply for content changes
- Sandbox environment by default; promote to prod on explicit approval

## Open questions

- Single provider (Anthropic) or abstracted via OpenRouter?
- How do we budget tokens per plan without feeling stingy?
- Should copilot write blocks, or only propose them for the builder to apply?
- How do we unit-test agent loops reliably?

## Success metrics

- ≥ 50% of tenants use copilot weekly by end of Phase 4
- ≥ 30% of page edits are copilot-initiated
- < 1% of copilot actions rolled back (not including user-requested undos)

## Ready-for-plan checklist

- [ ] Pricing model decided (seat, token, or bundled)
- [ ] Tool catalogue frozen
- [ ] Eval harness shape agreed
- [ ] Safety/guardrails design reviewed by security
