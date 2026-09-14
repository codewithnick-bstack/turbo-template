# Runbook: Webhook Delivery Broken

- **Severity ceiling:** P2
- **SLO:** 99.95% first-attempt success, 99.99% after retries

## Symptom

`webhook.delivery.failure_rate` alert fires; tenant reports missing events.

## Impact

- Third-party integrations (Slack, CRM, Zapier) out of sync
- Agent watchers miss state changes
- Replay UI backed up

## First actions

1. Check BullBoard `webhook-deliver` queue
2. Check outbound network health (egress proxy, DNS)
3. Check signing-key rotation status — a rotated key with un-updated subscription will return 401

## Diagnosis

- Cluster-wide failures → our side (worker, DNS, signer)
- Single tenant failing → their endpoint; notify tenant
- Mix → split investigation

## Mitigation

- Signing-key rotation incident: re-emit `subscription.reset_required` events; subscribers must reconfigure
- Our DNS: switch to backup resolver via `flags.set infra.use_backup_dns=true`
- Partner endpoint down: pause that subscription; email tenant

## Recovery

- Drain retry queue
- Offer replay for last 24h to affected tenants via admin button
- Clear alert
