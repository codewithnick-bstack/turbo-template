# Runbook: platform-api Down

- **Severity ceiling:** P1
- **SLO:** 99.9% availability, 30-day window

## Symptom

`/health` returns non-200 or times out; Grafana alert `platform-api.http.5xx > 5%` fires for 3 consecutive minutes.

## Impact

- Admin UI cannot load (editors blocked)
- Renderer ISR stalls; stale content continues to serve for cached paths
- Agent tools via MCP return errors
- Form submissions queue (if worker healthy) or fail

## First actions (≤ 5 min)

1. Acknowledge PagerDuty page
2. Open Grafana dashboard `platform-api`
3. Check Vercel deployment status for `platform-api`
4. Check Upstash Redis and Postgres status pages
5. Post in `#incident-channel` with severity + ETA

## Diagnosis

- 5xx spike + DB CPU spike → query storm; go to step M1
- 5xx spike + Redis eviction → queue backlog; go to step M2
- 5xx spike after recent deploy → bad release; go to step M3
- Timeouts with healthy DB + Redis → egress or DNS; escalate to infra

## Mitigation

- **M1 (query storm):** identify slow query via `pg_stat_activity`; kill; add or fix index in follow-up PR
- **M2 (Redis eviction):** raise memory tier or drain non-critical queues; pause AI jobs via `flags.set release.ai_jobs_enabled=false`
- **M3 (bad release):** roll back via Vercel UI or `vercel rollback`; do not hotfix in prod

## Recovery

- Confirm `/health` ok across all regions
- Confirm error rate < 0.5% for 10 consecutive minutes
- Resume any paused flags
- Mark PagerDuty incident resolved

## Postmortem checklist

- Incident doc filed within 24h
- Timeline pinned in `docs/solutions/` once mitigated
- Error-budget burn updated
- Blameless review scheduled within 5 days
