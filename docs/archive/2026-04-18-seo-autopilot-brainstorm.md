# SEO Autopilot — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 4

## Problem

SEO is a drumbeat of small fixes: meta tags, alt text, heading structure, schema, broken links, page speed. Editors forget, agencies charge extra, small-biz owners skip it. Autopilot eliminates the chore.

## Scope

- **Audit:** schedule + on-publish; Lighthouse CI + custom rules
- **Suggest:** prioritized fix list; LLM-generated copy diffs
- **Apply:** one-click or bulk apply; always reversible

## Audit checks (v1)

- Meta title/description presence + length
- Heading structure (single H1, logical hierarchy)
- Image alt text coverage
- Schema.org present on key page types
- Internal links dangling
- Outbound links rel attributes
- Sitemap entry fresh
- Canonical correct on paginated content

## Open questions

- How far does autopilot go without user approval?
- Do we plug Google Search Console for real-world data?
- Plan gating: free audit, paid apply?
- How do we not over-optimize (keyword stuffing risk from LLM suggestions)?

## Success metrics

- Demo sites: Lighthouse SEO score ≥ 95 after first pass
- ≥ 70% of suggestions applied (indicates trust)
- 0 cases of over-optimization penalties after 6 months
