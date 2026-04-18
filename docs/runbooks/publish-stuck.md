# Runbook: Publish Stuck / Stale

- **Severity ceiling:** P2

## Symptom

Editor publishes a page but the live URL does not update within 30s. Admin shows "Publishing…" indefinitely.

## Impact

- Individual page stale; not account-wide
- Trust impact: editors retry, inflate noise
- Webhook subscribers may miss `page.published` events

## First actions

1. Check BullBoard `revalidate` queue for failed/delayed jobs
2. Check `apps/worker` logs for the failing jobId
3. Confirm ISR revalidation token secret is valid

## Diagnosis

- Job stuck in `active` > 60s → worker hung; restart pod
- Job in `failed` → read error; common: revalidate token mismatch, Next.js deploy in progress
- Job missing → event bus not receiving publish; check `packages/core/pages/publish.ts` audit log

## Mitigation

- Retry: requeue job with the original jobId (idempotent)
- Manual revalidate: `pnpm -F worker exec tsx scripts/revalidate.ts <site> <path>`
- Deploy in progress: wait until new renderer version is live, then retry

## Recovery

- Confirm URL returns new content
- Confirm webhook delivered (check subscription log)
- Close incident

## Postmortem checklist

- If worker hung, capture heap snapshot
- File follow-up for missing idempotency key if seen
