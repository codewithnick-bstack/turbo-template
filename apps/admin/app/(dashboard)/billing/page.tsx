import { getApiClient } from "../../../lib/api";
import type { TTenant } from "@repo/sdk";

export default async function BillingPage() {
  const api = getApiClient();
  let tenant: TTenant | null = null;
  try {
    tenant = await api.tenants.current();
  } catch {
    // API unavailable
  }

  const plans = [
    { id: "starter", label: "Starter", price: "Free", features: ["1 site", "3 seats", "100 form submissions/mo"] },
    { id: "pro", label: "Pro", price: "$49/mo", features: ["10 sites", "10 seats", "10,000 form submissions/mo", "Custom domains"] },
    { id: "agency", label: "Agency", price: "$199/mo", features: ["Unlimited sites", "Unlimited seats", "Unlimited submissions", "White-label"] },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Billing</h1>
      {tenant && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Current plan: <span className="font-medium capitalize">{tenant.plan}</span>
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg border p-4 ${tenant?.plan === plan.id ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
          >
            <p className="text-sm font-semibold">{plan.label}</p>
            <p className="mt-1 text-2xl font-bold">{plan.price}</p>
            <ul className="mt-3 space-y-1">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-[var(--muted-foreground)]">✓ {f}</li>
              ))}
            </ul>
            {tenant?.plan !== plan.id && (
              <ChangePlanButton plan={plan.id as "starter" | "pro" | "agency"} label={`Switch to ${plan.label}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChangePlanButton({ plan, label }: { plan: "starter" | "pro" | "agency"; label: string }) {
  return (
    <form action={`/api/billing/plan`} method="POST" className="mt-3">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        className="w-full rounded border border-[var(--border)] py-1.5 text-xs font-medium hover:border-[var(--primary)]"
      >
        {label}
      </button>
    </form>
  );
}
