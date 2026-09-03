import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 8_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;

// Simple per-instance rate limit. Deployments running several instances should
// pair this with an edge or WAF rule; it is a speed bump, not a guarantee.
const hits = new Map<string, number[]>();

function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  // Strip control characters, then trim and cap the length.
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (limited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please try again in a minute." },
      { status: 429 }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ ok: false, error: "Message is too long." }, { status: 413 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this in.
  if (clean(payload.company, 100)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 160);
  const topic = clean(payload.topic, 60);
  const message = clean(payload.message, 4000);

  if (name.length < 2 || !EMAIL.test(email) || message.length < 20) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Please provide your name, a valid email address and a message of at least 20 characters.",
      },
      { status: 400 }
    );
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "The contact form is not connected to an inbox yet. Please email us directly and we will reply.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "georgiatutoringcenters.com",
        name,
        email,
        topic: topic || "General",
        message,
        receivedAt: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error(`Webhook responded ${response.status}`);
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not send that message. Please email us directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405 });
}
