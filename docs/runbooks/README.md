# Runbooks

Operational playbooks for on-call. Each runbook: **Symptom**, **Impact**, **First actions**, **Diagnosis**, **Mitigation**, **Recovery**, **Postmortem checklist**.

| Runbook                                                 | Surface           | Severity ceiling |
| ------------------------------------------------------- | ----------------- | ---------------- |
| [api-down](./api-down.md)                               | platform-api      | P1               |
| [publish-stuck](./publish-stuck.md)                     | worker / renderer | P2               |
| [webhook-delivery-broken](./webhook-delivery-broken.md) | worker            | P2               |
| [backup-restore](./backup-restore.md)                   | db                | P1               |
| [access-review](./access-review.md)                     | compliance        | P3               |
