import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { billingConfig, stripe } from "@/lib/billing";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import { resumeDoc, resumeFileName, resumeText } from "@/lib/resume-export";
import { emptyResume, templates, type ResumeData, type TemplateKey } from "@/lib/resume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 60_000;
const ACTIVE = new Set(["active", "trialing", "past_due"]);

type Subscriptions = { data: { status: string }[] };

/**
 * The paid download. Entitlement is checked here rather than in the browser,
 * so hiding the button is a courtesy and this is the actual gate.
 *
 * The resume is sent up only at this moment, turned into a file and returned.
 * It is not written to disk, logged or kept.
 */
export async function POST(request: Request) {
  // With no payment processor configured there is nothing to sell, so the
  // download runs free rather than dead-ending. Setting the Stripe variables
  // turns the paywall on without another code change.
  if (billingConfig().configured) {
    const store = await cookies();
    const session = readSession(store.get(SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Sign in to download your resume." },
        { status: 401 }
      );
    }

    try {
      const subs = await stripe<Subscriptions>(
        `subscriptions?customer=${encodeURIComponent(session.customer)}&status=all&limit=10`
      );
      if (!subs.data.some((sub) => ACTIVE.has(sub.status))) {
        return NextResponse.json(
          { ok: false, error: "This download needs an active subscription." },
          { status: 402 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "We could not confirm your subscription. Try again in a moment." },
        { status: 502 }
      );
    }
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "That resume is too long." }, { status: 413 });
  }

  let body: { data?: unknown; template?: unknown; format?: unknown };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const data = { ...emptyResume(), ...(body.data as ResumeData) };
  const template = templates.some((entry) => entry.key === body.template)
    ? (body.template as TemplateKey)
    : "classic";
  const format = body.format === "doc" ? "doc" : "txt";

  const file =
    format === "doc"
      ? { body: resumeDoc(data, template), type: "application/msword", ext: "doc" }
      : { body: resumeText(data), type: "text/plain; charset=utf-8", ext: "txt" };

  return new NextResponse(file.body, {
    headers: {
      "content-type": file.type,
      "content-disposition": `attachment; filename="${resumeFileName(data, file.ext)}"`,
      "cache-control": "no-store",
    },
  });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
