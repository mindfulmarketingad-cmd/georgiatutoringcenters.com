import { createHmac, timingSafeEqual } from "node:crypto";
import { billingConfig } from "@/lib/billing";

/**
 * Signed session cookie. There is no user database behind the resume builder:
 * the cookie itself carries the customer identity and is signed with
 * SESSION_SECRET so it cannot be edited into a paid session by hand.
 *
 * Entitlement is re-checked against the payment processor on every download,
 * so a cookie that outlives a cancelled subscription still cannot download.
 */
export const SESSION_COOKIE = "gtc_account";

/** Eight hours. Short, because the cookie is the only credential. */
const MAX_AGE = 60 * 60 * 8;

export type Session = {
  email: string;
  customer: string;
  /** Seconds since the epoch. */
  exp: number;
};

const b64 = (input: Buffer | string) =>
  Buffer.from(input).toString("base64url");

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSession(email: string, customer: string): string {
  const { sessionSecret } = billingConfig();
  const session: Session = {
    email,
    customer,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE,
  };
  const payload = b64(JSON.stringify(session));
  return `${payload}.${sign(payload, sessionSecret)}`;
}

export function readSession(value: string | undefined): Session | null {
  const { sessionSecret, configured } = billingConfig();
  if (!configured || !value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload, sessionSecret);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!session.customer || !session.email) return null;
    if (session.exp * 1000 < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
