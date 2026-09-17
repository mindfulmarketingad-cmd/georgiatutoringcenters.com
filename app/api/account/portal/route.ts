import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NOT_CONFIGURED, billingConfig, stripe } from "@/lib/billing";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Portal = { url: string };

/**
 * The billing portal, where a subscriber updates their card or cancels.
 * Cancelling has to be as easy as subscribing, so this is linked from the
 * account panel itself rather than buried in an email.
 */
export async function POST() {
  const { configured } = billingConfig();
  if (!configured) {
    return NextResponse.json({ ok: false, error: NOT_CONFIGURED }, { status: 503 });
  }

  const store = await cookies();
  const session = readSession(store.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });
  }

  try {
    const portal = await stripe<Portal>("billing_portal/sessions", {
      method: "POST",
      body: { customer: session.customer, return_url: `${site.url}/resume-builder` },
    });
    return NextResponse.json({ ok: true, url: portal.url });
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not open the billing portal. Please try again." },
      { status: 502 }
    );
  }
}
