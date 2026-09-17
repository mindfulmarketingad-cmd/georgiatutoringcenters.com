import { plan } from "@/lib/plan";

/**
 * Everything that talks to the payment processor reads its configuration from
 * here. With any of these unset the builder runs as a free tool: the download
 * routes skip the paywall rather than dead-ending, and the pages drop the
 * pricing copy, so the subscription switches on with the environment.
 */
export function billingConfig() {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const priceId = process.env.STRIPE_PRICE_ID ?? "";
  const sessionSecret = process.env.SESSION_SECRET ?? "";
  return {
    secretKey,
    priceId,
    sessionSecret,
    configured: Boolean(secretKey && priceId && sessionSecret.length >= 32),
  };
}

/** True once a payment processor is wired up. Until then downloads are free. */
export const billingLive = () => billingConfig().configured;

export const NOT_CONFIGURED =
  `Subscriptions are not switched on yet, so downloads are free for now. The plan will be ${plan.priceLabel} ${plan.intervalLabel} when it goes live.`;

/** Minimal Stripe REST call. Avoids pulling the SDK in for four endpoints. */
export async function stripe<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: Record<string, string> } = { method: "GET" }
): Promise<T> {
  const { secretKey } = billingConfig();
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method,
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
      "stripe-version": "2024-06-20",
    },
    body: init.body ? new URLSearchParams(init.body).toString() : undefined,
  });
  const payload = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Stripe responded ${response.status}`);
  }
  return payload;
}
