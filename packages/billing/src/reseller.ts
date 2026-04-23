import Stripe from "stripe";
import { AppError } from "@repo/observability";
import { z } from "zod";

const CreateConnectAccountInput = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email(),
  country: z.string().length(2).default("US"),
  markupPercent: z.number().min(0).max(100).default(20),
});

export type ConnectAccount = {
  accountId: string;
  tenantId: string;
  markupPercent: number;
  onboardingUrl?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new AppError("internal" as never, "STRIPE_SECRET_KEY not set");
  return new Stripe(key, { apiVersion: "2025-01-27.acacia" });
}

export async function createConnectAccount(
  input: unknown,
  returnUrl: string,
): Promise<ConnectAccount> {
  const parsed = CreateConnectAccountInput.parse(input);
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: "express",
    email: parsed.email,
    country: parsed.country,
    metadata: { tenantId: parsed.tenantId, markupPercent: String(parsed.markupPercent) },
    capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
  });

  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${returnUrl}?refresh=true`,
    return_url: `${returnUrl}?account=${account.id}`,
    type: "account_onboarding",
  });

  return {
    accountId: account.id,
    tenantId: parsed.tenantId,
    markupPercent: parsed.markupPercent,
    onboardingUrl: link.url,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  };
}

export async function getConnectAccount(accountId: string): Promise<ConnectAccount & { tenantId: string }> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(accountId);
  return {
    accountId: account.id,
    tenantId: account.metadata?.tenantId ?? "",
    markupPercent: Number(account.metadata?.markupPercent ?? 20),
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  };
}

export async function createResellerCheckout(opts: {
  connectAccountId: string;
  customerId: string;
  priceId: string;
  markupPercent: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const applicationFeePercent = Math.min(opts.markupPercent, 30);

  const session = await stripe.checkout.sessions.create({
    customer: opts.customerId,
    mode: "subscription",
    line_items: [{ price: opts.priceId, quantity: 1 }],
    subscription_data: { application_fee_percent: applicationFeePercent },
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
  }, { stripeAccount: opts.connectAccountId });

  if (!session.url) throw new AppError("internal" as never, "Stripe checkout URL missing");
  return { url: session.url };
}

export async function createPayout(opts: {
  connectAccountId: string;
  amount: number;
  currency?: string;
}): Promise<{ payoutId: string }> {
  const stripe = getStripe();
  const payout = await stripe.payouts.create(
    { amount: opts.amount, currency: opts.currency ?? "usd" },
    { stripeAccount: opts.connectAccountId },
  );
  return { payoutId: payout.id };
}
