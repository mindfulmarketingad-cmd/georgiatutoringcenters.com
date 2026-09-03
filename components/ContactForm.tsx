"use client";

import { useState } from "react";
import { site } from "@/lib/site";

type State = { status: "idle" | "sending" | "sent" | "error"; message?: string };

export default function ContactForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState({ status: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (result.ok) {
        form.reset();
        setState({ status: "sent", message: "Thanks. We will reply to the address you gave us." });
      } else {
        setState({
          status: "error",
          message: result.error ?? `Something went wrong. Please email ${site.email} directly.`,
        });
      }
    } catch {
      setState({
        status: "error",
        message: `We could not send that message. Please email ${site.email} directly.`,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="contact-name">Your name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-email">Email address</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-topic">What is this about?</label>
        <select id="contact-topic" name="topic" defaultValue="General question">
          <option>General question</option>
          <option>Add my tutoring center</option>
          <option>Correct a listing</option>
          <option>Claim a listing</option>
          <option>Advertising</option>
          <option>Report a problem</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" required minLength={20} maxLength={4000} />
        <span className="form-help">
          Include the business name and address if you are asking about a listing.
        </span>
      </div>

      {/* Honeypot field, hidden from real users. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="btn" type="submit" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending" : "Send message"}
      </button>

      {state.message && (
        <p className="notice" role="status" style={{ marginTop: "1rem" }}>
          {state.message}
        </p>
      )}
    </form>
  );
}
