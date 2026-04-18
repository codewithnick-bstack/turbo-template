import { Hono } from "hono";
import { Billing } from "@repo/core";
import {
  createCheckoutSession,
  createBillingPortalSession,
  STRIPE_PRICE_IDS,
  parseStripeWebhook,
} from "@repo/billing";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const billingRoute = new Hono<AuthEnv>()
  .use("/entitlements", authMiddleware)
  .use("/plan", authMiddleware)
  .use("/checkout", authMiddleware)
  .use("/portal", authMiddleware)
  .get("/entitlements", async (c) => {
    try {
      const capability = c.req.query("capability");
      if (!capability)
        return c.json({ code: "bad_request", message: "capability query param required" }, 400);
      const result = await Billing.checkEntitlement(
        buildCtx(c),
        capability as Parameters<typeof Billing.checkEntitlement>[1],
      );
      return c.json(result);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/plan", async (c) => {
    try {
      const { plan } = await c.req.json<{ plan: "starter" | "pro" | "agency" }>();
      const result = await Billing.setPlan(buildCtx(c), plan);
      return c.json(result);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/checkout", async (c) => {
    try {
      const { plan, successUrl, cancelUrl } = await c.req.json<{
        plan: "starter" | "pro" | "agency";
        successUrl: string;
        cancelUrl: string;
      }>();
      const ctx = buildCtx(c);
      const priceId = STRIPE_PRICE_IDS[`${plan}_monthly`];
      if (!priceId) return c.json({ code: "bad_request", message: "unknown plan" }, 400);

      const tenant = await Billing.getTenant(ctx);
      const session = await createCheckoutSession({
        customerId: tenant.stripeCustomerId ?? "",
        priceId,
        successUrl,
        cancelUrl,
        metadata: { tenantId: ctx.tenantId, plan },
      });
      return c.json({ url: session.url });
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/portal", async (c) => {
    try {
      const { returnUrl } = await c.req.json<{ returnUrl: string }>();
      const ctx = buildCtx(c);
      const tenant = await Billing.getTenant(ctx);
      if (!tenant.stripeCustomerId)
        return c.json({ code: "bad_request", message: "no Stripe customer on file" }, 400);
      const session = await createBillingPortalSession({
        customerId: tenant.stripeCustomerId,
        returnUrl,
      });
      return c.json({ url: session.url });
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/webhook", async (c) => {
    const rawBody = await c.req.text();
    const sig = c.req.header("stripe-signature") ?? "";
    const result = parseStripeWebhook(rawBody, sig);
    if (!result) return c.json({ code: "bad_request", message: "invalid signature" }, 400);

    try {
      if (
        result.type === "customer.subscription.created" ||
        result.type === "customer.subscription.updated" ||
        result.type === "customer.subscription.deleted"
      ) {
        await Billing.handleSubscriptionUpdate(result.data as Parameters<typeof Billing.handleSubscriptionUpdate>[0]);
      }
    } catch {
      // log but ack — Stripe will retry
    }
    return c.json({ received: true });
  });
