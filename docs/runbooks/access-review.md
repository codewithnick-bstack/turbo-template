# Runbook: Monthly Access Review

- **Severity ceiling:** P3 (compliance)
- **Owner:** Security lead (rotates quarterly)

## Scope

All humans and machine identities with access to:

- Production Postgres
- Production Redis
- R2 media bucket
- Stripe Connected Platform
- Auth provider admin
- Vercel org, Cloudflare org
- GitHub org
- Observability tools

## Procedure

1. Generate access report: `pnpm -F core access-report --format=csv --env=prod`
2. Cross-check against active org chart
3. For each identity: justify, downgrade, or revoke
4. Upload evidence to Vanta/Drata with reviewer attestation
5. File tickets for anomalies; resolve within 7 days

## SLA

- Review complete by 5th business day of each month
- Anomalies remediated within 7 days
- Quarterly sample audited by second reviewer
