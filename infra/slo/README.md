# SLO definitions

Populated during Phase 6 Unit 6.5. One YAML per surface with:

```yaml
service: platform-api
slo:
  availability: 99.9
  latency_p95_ms: 500
window_days: 30
error_budget_policy:
  freeze_threshold: 30 # freeze non-critical merges after 30% of budget burned
  alert_thresholds: [50, 75, 90]
```
