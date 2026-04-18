import type Stripe from "stripe";
import { constructWebhookEvent } from "./stripe";
import type { PlanId } from "./plans";

export type SubscriptionUpdatedPayload = {
  customerId: string;
  subscriptionId: string;
  status: Stripe.Subscription.Status;
  planId: PlanId | null;
  currentPeriodEnd: number;
};

const PRICE_TO_PLAN: Record<string, PlanId> = {
  [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? ""]: "starter",
  [process.env.STRIPE_PRICE_PRO_MONTHLY ?? ""]: "pro",
  [process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? ""]: "agency",
};

function extractPlan(sub: Stripe.Subscription): PlanId | null {
  const item = sub.items.data[0];
  if (!item) return null;
  const priceId = item.price.id;
  return PRICE_TO_PLAN[priceId] ?? null;
}

export function parseStripeWebhook(
  rawBody: string | Buffer,
  signature: string,
): { type: string; data: unknown } | null {
  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch {
    return null;
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const payload: SubscriptionUpdatedPayload = {
        customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        subscriptionId: sub.id,
        status: sub.status,
        planId: extractPlan(sub),
        currentPeriodEnd: sub.current_period_end,
      };
      return { type: event.type, data: payload };
    }
    case "checkout.session.completed":
      return { type: event.type, data: event.data.object };
    default:
      return { type: event.type, data: event.data.object };
  }
}
