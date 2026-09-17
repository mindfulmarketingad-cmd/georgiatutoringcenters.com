"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { plan } from "@/lib/plan";
import { fullName, type ResumeData, type TemplateKey } from "@/lib/resume";

type Account = {
  configured: boolean;
  signedIn: boolean;
  subscribed: boolean;
  email?: string;
  renewsAt?: string | null;
  error?: string;
};

/** Reads the query string without an effect, so the first render matches. */
function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}
const currentSearch = () => window.location.search;
const noSearch = () => "";

/**
 * The download gate.
 *
 * Hiding the buttons is only a courtesy: the real check happens in
 * /api/resume/download, which asks the payment processor whether this
 * customer's subscription is live before it returns a single byte.
 */
export default function ResumeDownload({
  data,
  template,
  onLockChange,
}: {
  data: ResumeData;
  template: TemplateKey;
  onLockChange: (locked: boolean) => void;
}) {
  const search = useSyncExternalStore(subscribeToUrl, currentSearch, noSearch);
  const [account, setAccount] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const justPaid = search.includes("checkout=done");
  const cancelled = search.includes("checkout=cancelled");

  // Ask once on mount, without a synchronous setState in the effect body, so
  // the print lock and the buttons are right before anyone clicks anything.
  useEffect(() => {
    let alive = true;
    fetch("/api/account", { cache: "no-store" })
      .then((response) => response.json() as Promise<Account>)
      .then((next) => {
        if (!alive) return;
        setAccount(next);
        onLockChange(next.configured && !next.subscribed);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [onLockChange]);

  const refresh = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      const next = (await response.json()) as Account;
      setAccount(next);
      onLockChange(next.configured && !next.subscribed);
      return next;
    } catch {
      setMessage("We could not reach your account. Check your connection and try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }, [onLockChange]);

  async function openGate() {
    setOpen(true);
    if (!account) await refresh();
  }

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (result.ok && result.url) window.location.href = result.url;
      else setMessage(result.error ?? "We could not start the checkout. Please try again.");
    } catch {
      setMessage("We could not start the checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function download(format: "doc" | "txt") {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/resume/download", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data, template, format }),
      });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setMessage(result.error ?? "That download did not work. Please try again.");
        await refresh();
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const name = fullName(data).replace(/[^A-Za-z0-9]+/g, "-").toLowerCase() || "resume";
      link.download = `${name}-resume.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("That download did not work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function manageBilling() {
    setBusy(true);
    try {
      const response = await fetch("/api/account/portal", { method: "POST" });
      const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (result.ok && result.url) window.location.href = result.url;
      else setMessage(result.error ?? "We could not open the billing portal.");
    } catch {
      setMessage("We could not open the billing portal.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/account", { method: "DELETE" });
    setMessage("Signed out on this device.");
    await refresh();
  }

  // Nothing to sell until a payment processor is configured, so downloads are
  // open in that state rather than pointing at a checkout that cannot run.
  const canDownload = account ? !account.configured || account.subscribed : false;

  return (
    <div className="rb-gate">
      {justPaid && !canDownload && (
        <p className="notice" role="status">
          Payment received. Choose download below and we will confirm your subscription.
        </p>
      )}
      {cancelled && (
        <p className="notice" role="status">
          Checkout cancelled. Nothing was charged, and your resume is exactly as you left it.
        </p>
      )}

      {!open && !canDownload && (
        <button type="button" className="btn" onClick={openGate}>
          Download Resume
        </button>
      )}

      {canDownload && (
        <div className="rb-gate-actions">
          <button type="button" className="btn" onClick={() => window.print()} disabled={busy}>
            Download PDF
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => download("doc")}
            disabled={busy}
          >
            Download Word
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => download("txt")}
            disabled={busy}
          >
            Download Plain Text
          </button>
        </div>
      )}

      {open && !canDownload && (
        <div className="rb-plan">
          <h3>Download Your Resume</h3>
          <p className="rb-plan-price">
            <span className="rb-plan-amount">{plan.priceLabel}</span>
            <span className="rb-plan-interval">{plan.intervalLabel}</span>
          </p>
          <ul className="rb-plan-includes">
            {plan.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="rb-plan-terms">{plan.renewalNotice}</p>

          {account?.configured !== false && (
            <form onSubmit={subscribe}>
              <div className="form-field">
                <label htmlFor="rb-account-email">Email address</label>
                <input
                  id="rb-account-email"
                  type="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => setEmail(event.target.value)}
                />
                <span className="form-help">
                  This is your sign-in and where the receipt goes. Payment is handled by Stripe;
                  card details never reach this site.
                </span>
              </div>
              <button type="submit" className="btn" disabled={busy}>
                {busy ? "Working" : `Continue to Payment`}
              </button>
            </form>
          )}

          <p className="rb-plan-back">
            Already subscribed on this device?{" "}
            <button type="button" className="rb-link" onClick={refresh} disabled={busy}>
              Check my account
            </button>
            {account?.signedIn && (
              <>
                {" "}
                &middot;{" "}
                <button type="button" className="rb-link" onClick={manageBilling} disabled={busy}>
                  Manage or cancel billing
                </button>
              </>
            )}
          </p>
          <p className="rb-plan-back">
            <button type="button" className="rb-link" onClick={() => setOpen(false)}>
              Not now, keep editing
            </button>
          </p>
        </div>
      )}

      {canDownload && account?.email && (
        <p className="rb-help rb-gate-account">
          Signed in as {account.email}.{" "}
          <button type="button" className="rb-link" onClick={manageBilling} disabled={busy}>
            Manage or cancel billing
          </button>{" "}
          &middot;{" "}
          <button type="button" className="rb-link" onClick={signOut}>
            Sign out
          </button>
        </p>
      )}

      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
