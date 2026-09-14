# ADR 0001: Monorepo on pnpm + Turborepo

- **Status:** Accepted
- **Date:** 2026-04-18

## Context

The project spans renderer, admin UI, API, worker, MCP server, and many shared packages. We need fast local dev, cacheable CI, and easy cross-package refactors without publishing to npm between every change.

## Decision

Adopt **pnpm workspaces + Turborepo**:

- pnpm for hoisting-free, content-addressable installs and strict `peerDependencies`
- Turborepo for task orchestration, remote cache, and topological builds

Workspace globs: `apps/*` + `packages/*`.

## Consequences

- Single lockfile, consistent versions across packages
- Remote cache massively speeds up CI
- All packages share tooling from `packages/config` and `packages/eslint-config`
- Trade-off: remote cache requires Vercel or self-hosted turbo cache; mitigated by running cache-less as fallback

## Alternatives Considered

- **Nx** — more features, higher ceremony; Turborepo's simplicity wins for our scale
- **Multi-repo with Renovate** — painful cross-repo refactors; rejected
