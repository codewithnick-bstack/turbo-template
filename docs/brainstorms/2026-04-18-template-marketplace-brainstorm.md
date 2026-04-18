# Template Marketplace — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 5 (v1 first-party) → Phase 7 (v2 third-party)

## Problem

Agencies want repeatable starting points. Small-biz owners want "looks like theirs, but mine". Third-party designers want to earn by publishing templates.

## Phases of the marketplace

- **v1 (Phase 5):** first-party templates only, free, baked into onboarding
- **v2 (post-roadmap):** third-party authors, paid templates, revenue share
- **v3 (future):** template collections, vertical kits, upgradable templates

## Data model

Template = serialized Site + Pages + Blocks + Content entries + default media references + example copy. Clone creates new site with new asset IDs.

## Open questions

- Do we fork or reference media on clone?
- How to version a template so existing clones can accept updates?
- Licensing model for third-party authors?
- How do we block low-quality templates (review? auto a11y scan?)?

## Success metrics (v1)

- ≥ 4 first-party templates live
- ≥ 40% of new sites start from a template
- ≥ 80% of template clones reach publish within first session

## Ready-for-plan checklist

- [ ] Decide clone = fork-media vs reference-media
- [ ] Decide template versioning model
- [ ] Define template quality checklist (a11y, perf, SEO)
