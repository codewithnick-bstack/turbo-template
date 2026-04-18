"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Plan } from "@repo/billing";

export function BillingClient({ plans }: { plans: Plan[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planId,
          successUrl: `${window.location.origin}/settings/billing?success=1`,
          cancelUrl: window.location.href,
        }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handlePortal}
          disabled={loading === "portal"}
          className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          {loading === "portal" && <Loader2 size={14} className="animate-spin" />}
          Manage Subscription
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check size={14} className="mt-0.5 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleUpgrade(plan.id)}
              disabled={!!loading}
              className="mt-6 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === plan.id && <Loader2 size={14} className="animate-spin" />}
              Get {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
