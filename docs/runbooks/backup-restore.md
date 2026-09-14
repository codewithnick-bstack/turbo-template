# Runbook: Backup and Restore

- **Severity ceiling:** P1 (when invoked)
- **RPO target:** ≤ 1 hour
- **RTO target:** ≤ 4 hours

## Backup posture

- Postgres: continuous WAL archiving + nightly snapshot (Neon/Supabase managed)
- R2 media: versioned buckets with 30-day retention
- Redis: no backup (treated as ephemeral cache/queue)
- Secrets: dual-custody in vendor + 1Password team vault

## Restore scenarios

### Full DB restore (data-loss incident)

1. Stop platform-api (or put in read-only via `flags.set maintenance.read_only=true`)
2. Restore Postgres branch from point-in-time via Neon console or CLI
3. Validate with `pnpm -F db verify-restore`
4. Swap DATABASE_URL to restored branch
5. Resume traffic; drain outbound webhook backlog

### Single-tenant rollback

1. Identify tenant_id + point in time
2. Run `pnpm -F db rollback-tenant --id=<tenant> --at=<iso>`
3. Tenant notified; audit log row added with `actor=oncall, reason=<ticket>`

### Media restore

1. Identify object key or prefix
2. Use versioned bucket UI or `pnpm -F worker restore-object --key=<key> --version=<id>`

## Rehearsal

- Weekly restore rehearsal runs in staging from prod snapshot
- Quarterly tabletop exercise with on-call rotation
- Any missed rehearsal becomes a P3 follow-up
