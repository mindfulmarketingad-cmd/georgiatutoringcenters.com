import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { billingConfig, stripe } from "@/lib/billing";
import { plan } from "@/lib/plan";
import { SESSION_COOKIE, cookieOptions, readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Subscriptions = { data: { status: string; current_period_end: number }[] };

const ACTIVE = new Set(["active", "trialing", "past_due"]);

/**
 * Who is signed in and whether their subscription is live. Asked by the
 * builder before it offers a download, and again by the download itself.
 */
export async function GET() {
  const { configured } = billingConfig();
  if (!configured) {
    return NextResponse.json({ configured: false, signedIn: false, subscribed: false, plan });
  }

  const store = await cookies();
  const session = readSession(store.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ configured: true, signedIn: false, subscribed: false, plan });
  }

  try {
    const subs = await stripe<Subscriptions>(
      `subscriptions?customer=${encodeURIComponent(session.customer)}&status=all&limit=10`
    );
    const live = subs.data.find((sub) => ACTIVE.has(sub.status));
    return NextResponse.json({
      configured: true,
      signedIn: true,
      email: session.email,
      subscribed: Boolean(live),
      renewsAt: live ? new Date(live.current_period_end * 1000).toISOString() : null,
      plan,
    });
  } catch {
    // Never claim a subscription we could not confirm.
    return NextResponse.json({
      configured: true,
      signedIn: true,
      email: session.email,
      subscribed: false,
      error: "We could not reach the billing system. Try again in a moment.",
      plan,
    });
  }
}

/** Sign out. */
export async function DELETE() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
