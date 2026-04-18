import type Stripe from "stripe";
import { getStripe } from "./stripe";

export type UsageMeter = "form_submissions" | "ai_tokens" | "page_views";

export async function reportUsage({
  subscriptionItemId,
  meter,
  quantity,
  timestamp,
}: {
  subscriptionItemId: string;
  meter: UsageMeter;
  quantity: number;
  timestamp?: number;
}): Promise<Stripe.Billing.MeterEvent> {
  return getStripe().billing.meterEvents.create({
    event_name: meter,
    payload: {
      stripe_customer_id: subscriptionItemId,
      value: String(quantity),
    },
    timestamp: timestamp ? Math.floor(timestamp / 1000) : Math.floor(Date.now() / 1000),
  });
}
