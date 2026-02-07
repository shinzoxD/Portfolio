import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CONTACT_FORM_ACTION, FORMSPARK_FORM_ID } from "../data/siteConfig.js";

function encodeFormData(data) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    params.set(key, value);
  }
  return params.toString();
}

function Toast({ message, tone }) {
  const base =
    "fixed bottom-5 left-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ring-1 backdrop-blur";
  const theme =
    tone === "error"
      ? "bg-white/15 text-white ring-white/30"
      : "bg-white/10 text-white ring-white/20";
  return (
    <div role="status" aria-live="polite" className={[base, theme].join(" ")}>
      {message}
    </div>
  );
}

export default function ContactForm({
  subtitle = "Send a message and I will get back to you soon.",
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [botField, setBotField] = useState("");
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(0);

  const showToast = useCallback((next) => {
    setToast(next);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  const formAction = useMemo(() => {
    if (FORMSPARK_FORM_ID) return "/?sent=1#contact";
    if (CONTACT_FORM_ACTION) return CONTACT_FORM_ACTION;
    return "/?sent=1#contact";
  }, []);

  const usesExternalAction = Boolean(CONTACT_FORM_ACTION) && !FORMSPARK_FORM_ID;

  const nextUrl = useMemo(() => {
    if (typeof window !== "object") return "/?sent=1#contact";
    return `${window.location.origin}${window.location.pathname}?sent=1#contact`;
  }, []);

  const targetUrl = useMemo(() => {
    if (FORMSPARK_FORM_ID) return `https://submit-form.com/${FORMSPARK_FORM_ID}`;
    return "/";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sent = params.get("sent");
    const error = params.get("error");

    if (sent === "1") {
      showToast({ tone: "success", message: "Message sent! I'll reply soon." });
    } else if (error === "1") {
      showToast({ tone: "error", message: "Something went wrong. Please try again." });
    }

    if (sent || error) {
      params.delete("sent");
      params.delete("error");
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [showToast]);

  const handleSubmit = async (e) => {
    if (!FORMSPARK_FORM_ID) return;
    e.preventDefault();
    if (submitting) return;

    if (botField) {
      showToast({ tone: "error", message: "Something went wrong. Please try again." });
      return;
    }

    setSubmitting(true);
    try {
      if (FORMSPARK_FORM_ID) {
        const res = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        const body = encodeFormData({
          "form-name": "contact",
          name,
          email,
          message,
          "bot-field": botField,
        });
        const res = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        if (!res.ok) throw new Error("Request failed");
      }

      setName("");
      setEmail("");
      setMessage("");
      showToast({ tone: "success", message: "Message sent! I'll reply soon." });
    } catch (err) {
      showToast({ tone: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Contact</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-10">
        <form
          className="reveal rounded-2xl bg-white/5 p-6 ring-1 ring-white/10"
          name="contact"
          method="POST"
          action={formAction}
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          {usesExternalAction ? (
            <>
              <input type="hidden" name="_subject" value="New portfolio message" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_next" value={nextUrl} />
            </>
          ) : null}
          <p className="sr-only">
            <label>
              Do not fill this out if you are human:{" "}
              <input
                name="bot-field"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
              />
            </label>
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="contact-name" className="text-sm font-semibold">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl bg-black/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 placeholder:text-white/40 focus:ring-slate-400/50"
                placeholder="Your name"
                required
                aria-label="Your name"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="text-sm font-semibold">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl bg-black/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 placeholder:text-white/40 focus:ring-slate-400/50"
                placeholder="you@example.com"
                required
                aria-label="Your email"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="text-sm font-semibold">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows="6"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 w-full resize-none rounded-xl bg-black/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 placeholder:text-white/40 focus:ring-slate-400/50"
                placeholder="Tell me about what you want to build or analyze."
                required
                aria-label="Your message"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 px-4 py-3 text-sm font-semibold text-black hover:brightness-110"
              aria-label="Send message"
            >
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
    </div>
  );
}
