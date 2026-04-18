import { z } from "zod";
import { Id, Tenanted, Timestamps } from "./common";

export const WebhookEventName = z.enum([
  "page.published",
  "page.unpublished",
  "page.updated",
  "site.created",
  "site.domain_bound",
  "form.submitted",
  "content.updated",
  "media.uploaded",
  "tenant.upgraded",
  "tenant.downgraded",
]);

export const WebhookSubscription = z
  .object({
    id: Id,
    url: z.string().url(),
    events: z.array(WebhookEventName).min(1),
    secret: z.string().min(32),
    active: z.boolean().default(true),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export const WebhookDelivery = z
  .object({
    id: Id,
    subscriptionId: Id,
    event: WebhookEventName,
    payload: z.record(z.unknown()),
    attempts: z.number().int().nonnegative(),
    status: z.enum(["pending", "succeeded", "failed", "dead"]),
    lastResponseStatus: z.number().int().nullable(),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export type TWebhookEventName = z.infer<typeof WebhookEventName>;
export type TWebhookSubscription = z.infer<typeof WebhookSubscription>;
