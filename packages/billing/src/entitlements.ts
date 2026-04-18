import { PLANS, type PlanId } from "./plans";

export type Capability =
  | "sites.create"
  | "seats.invite"
  | "forms.submit"
  | "ai.use"
  | "reseller.enable";

export type EntitlementDecision =
  | { allowed: true }
  | { allowed: false; reason: "quota_exhausted" | "plan_required"; upgrade?: PlanId };

export type UsageSnapshot = {
  sites: number;
  seats: number;
  formSubmissionsThisMonth: number;
  aiTokensThisMonth: number;
};

export function checkEntitlement(
  plan: PlanId,
  capability: Capability,
  usage: UsageSnapshot,
): EntitlementDecision {
  const limits = PLANS[plan];

  switch (capability) {
    case "sites.create":
      return usage.sites < limits.includedSites
        ? { allowed: true }
        : { allowed: false, reason: "quota_exhausted", upgrade: nextTier(plan) };
    case "seats.invite":
      return usage.seats < limits.includedSeats
        ? { allowed: true }
        : { allowed: false, reason: "quota_exhausted", upgrade: nextTier(plan) };
    case "forms.submit":
      return usage.formSubmissionsThisMonth < limits.includedFormSubmissions
        ? { allowed: true }
        : { allowed: false, reason: "quota_exhausted", upgrade: nextTier(plan) };
    case "ai.use":
      return usage.aiTokensThisMonth < limits.includedAiTokens
        ? { allowed: true }
        : { allowed: false, reason: "quota_exhausted", upgrade: nextTier(plan) };
    case "reseller.enable":
      return limits.canResell
        ? { allowed: true }
        : { allowed: false, reason: "plan_required", upgrade: "agency" };
  }
}

function nextTier(plan: PlanId): PlanId | undefined {
  if (plan === "starter") return "pro";
  if (plan === "pro") return "agency";
  return undefined;
}
