import Stripe from "stripe";

import { lazyClient } from "@/lib/self-host/lazy-client";

/**
 * [self-host] Constructed lazily.
 *
 * Stripe's constructor throws "Neither apiKey nor config.authenticator
 * provided" when handed an empty key. Building these at module scope took the
 * whole app down on an instance with no Stripe account: /api/auth/csrf
 * transitively imports this module, so sign-in returned 500 and nobody could
 * log in at all.
 *
 * Deferring construction means only genuine billing calls fail, which is
 * correct — there is no billing on a self-hosted instance.
 */
const stripeConfig = {
  // Kept as upstream has it. The installed `stripe` types reject this literal
  // (see the typescript block in next.config.mjs), but the API accepts it.
  apiVersion: "2024-06-20" as any,
  appInfo: {
    name: "Papermark.io",
    version: "0.1.0",
  },
  typescript: true as const,
};

const stripeOld = lazyClient(
  () =>
    new Stripe(
      process.env.STRIPE_SECRET_KEY_LIVE_OLD ??
        process.env.STRIPE_SECRET_KEY_OLD ??
        "",
      stripeConfig,
    ),
);

const stripeNew = lazyClient(
  () =>
    new Stripe(
      process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
      stripeConfig,
    ),
);

export const stripeInstance = (account: boolean = false) => {
  return account ? stripeOld : stripeNew;
};

export async function cancelSubscription(
  customer?: string,
  isOldAccount: boolean = false,
) {
  if (!customer) return;

  try {
    const stripe = stripeInstance(isOldAccount);
    const subscriptionId = await stripe.subscriptions
      .list({
        customer,
      })
      .then((res) => res.data[0].id);

    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
      cancellation_details: {
        comment: "Customer deleted their Papermark instance.",
      },
    });
  } catch (error) {
    return;
  }
}
