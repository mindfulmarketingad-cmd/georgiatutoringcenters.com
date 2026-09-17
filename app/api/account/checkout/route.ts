import { NextResponse } from "next/server";
import { NOT_CONFIGURED, billingConfig, stripe } from "@/lib/billing";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type CheckoutSession = { url: string };

/**
 * Starts a subscription. The visitor gives an email address, Stripe Checkout
 * collects the payment details, and the callback route turns the completed
 * session into a signed cookie. No card data ever reaches this site.
 */
export async function POST(request: Request) {
  const { configured, priceId } = billingConfig();
  if (!configured) {
    return NextResponse.json({ ok: false, error: NOT_CONFIGURED }, { status: 503 });
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().slice(0, 160) : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid email address so we can send your receipt." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe<CheckoutSession>("checkout/sessions", {
      method: "POST",
      body: {
        mode: "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        customer_email: email,
        allow_promotion_codes: "true",
        client_reference_id: "resume-builder",
        success_url: `${site.url}/api/account/callback?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${site.url}/resume-builder?checkout=cancelled`,
      },
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not start the checkout. Please try again." },
      { status: 502 }
    );
  }
}
