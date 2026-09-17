import { NextResponse } from "next/server";
import { billingConfig, stripe } from "@/lib/billing";
import { SESSION_COOKIE, cookieOptions, createSession } from "@/lib/session";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutSession = {
  status: string;
  customer: string | null;
  customer_details: { email: string | null } | null;
};

/**
 * Where Stripe Checkout returns to. The session id in the URL is only a
 * lookup key: the subscription is confirmed by asking Stripe directly, so a
 * guessed or replayed id cannot mint a signed cookie.
 */
export async function GET(request: Request) {
  const { configured } = billingConfig();
  const back = (state: string) =>
    NextResponse.redirect(`${site.url}/resume-builder?checkout=${state}`, { status: 303 });

  if (!configured) return back("unavailable");

  const id = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return back("failed");

  try {
    const session = await stripe<CheckoutSession>(`checkout/sessions/${encodeURIComponent(id)}`);
    const email = session.customer_details?.email ?? "";
    if (session.status !== "complete" || !session.customer || !email) return back("failed");

    const response = back("done");
    response.cookies.set(SESSION_COOKIE, createSession(email, session.customer), cookieOptions);
    return response;
  } catch {
    return back("failed");
  }
}
