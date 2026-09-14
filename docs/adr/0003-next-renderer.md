# ADR 0003: Next.js 15 App Router as Renderer

- **Status:** Accepted
- **Date:** 2026-04-18

## Context

Customer sites must be fast (Core Web Vitals ≥ Good at p75), SEO-friendly, compatible with custom domains, and easy to extend with user-defined blocks. The starter already uses Next.js 15.

## Decision

`apps/web` remains the **renderer** for customer sites. It consumes data from `apps/platform-api` and renders block trees produced by the admin builder.

- App Router + React Server Components by default
- Incremental Static Regeneration with on-demand revalidation via webhook from the worker
- Edge middleware resolves host → site (multi-tenant / custom-domain)
- The admin surface is a separate Next.js app (`apps/admin`) to keep renderer bundle lean

## Consequences

- Single rendering engine reduces operational complexity
- Custom domains use Vercel Platforms primitives
- Trade-off: locked to Next.js major-version upgrades; mitigated by framework-agnostic block schemas

## Alternatives Considered

- **Astro** — fast, but weaker App-Router-style interactivity for builder preview
- **Remix** — viable; team already productive in Next.js
- **Self-rolled SSR** — rejected
