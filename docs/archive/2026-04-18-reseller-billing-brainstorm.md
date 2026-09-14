# Reseller Billing via Stripe Connect — Brainstorm

- **Status:** Draft
- **Date:** 2026-04-18
- **Phase:** 5

## Problem

Agencies want to white-label the platform AND earn margin on the subscription. Platform wants to keep Stripe as the billing authority and avoid custom money math.

## Key decisions

- Stripe Connect type: Express (fastest onboarding) vs Standard (agency keeps full Stripe account) — lean Express
- Application fee model: platform takes fixed % of gross; agency sets markup
- Who owns the customer record? Platform does; agency has read + selective actions (refund, cancel)

## Edge cases

- Refunds: split across platform fee + agency payout proportionally
- Disputes: platform fronts refund; agency balance clawed back
- Tax: Stripe Tax computed on client's jurisdiction
- Past-due: gate only that client's sites; not the agency

## Open questions

- Can agencies set custom plans or only apply markups to platform plans?
- How does plan-gated feature access work when agency upsells?
- Do agencies see client card details? (No — PCI boundary)
- Can clients "take ownership" and leave the agency? Policy + technical path

## Success metrics

- ≥ 3 agencies with ≥ 10 paying clients each by end of Phase 5
- Reseller GMV > $10k/mo
- Connect onboarding p50 < 10 min

## Ready-for-plan checklist

- [ ] Accounting sign-off on application-fee model
- [ ] Legal sign-off on chargeback flow
- [ ] Agency survey: markup vs custom plan preference
- [ ] Support playbook for ownership transfer
