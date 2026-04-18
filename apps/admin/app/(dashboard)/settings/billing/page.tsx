import { getApiClient } from "@/lib/api";
import { BillingClient } from "./billing-client";
import { PLANS } from "@repo/billing";

export default async function BillingPage() {
  const api = getApiClient();
  let current: { allowed?: boolean; plan?: string } = {};

  try {
    current = (await api.billing.checkEntitlement("sites.create")) as typeof current;
  } catch {
    // API unavailable
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Billing &amp; Plan</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage your subscription and usage.</p>
      <BillingClient plans={Object.values(PLANS)} />
    </div>
  );
}
