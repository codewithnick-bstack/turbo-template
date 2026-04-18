# Changesets

Run `pnpm changeset` to stage a version bump with notes. CI opens or updates a "Version Packages" PR; merging that publishes packages.

Apps (`web`, `api`, `cron`, `admin`, `platform-api`, `worker`, `mcp`, `docs-site`) are ignored — they deploy via their own pipelines.
