import React, { useEffect, useMemo, useRef, useState } from "react";
import { PROFILE } from "../data/siteConfig.js";

function ActionButton({ href, children, ariaLabel }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-white/15 bg-white/5 hover:bg-white/10 focus:outline-none focus-visible:outline-none";

  if (href && href !== "#") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={base}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={base} role="link" aria-disabled="true" aria-label={ariaLabel}>
      {children}
    </span>
  );
}

export default function Hero({
  resumeHref,
  onNavigate,
  profile,
  roles,
  showProjectsButton = true,
}) {
  const heroProfile = profile && typeof profile === "object" ? profile : PROFILE;
  const heroRef = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const roleTimerRef = useRef(0);
  const roleIntervalRef = useRef(0);
  const roleList = useMemo(() => {
    if (Array.isArray(roles)) {
      const cleaned = roles
        .map((role) => (typeof role === "string" ? role.trim() : ""))
        .filter((role) => role.length > 0);
      if (cleaned.length > 0) return cleaned;
    }
    return ["Data Scientist", "ML Engineer", "AI Engineer"];
  }, [roles]);
  const roleMinWidth = useMemo(() => {
    const lengths = roleList.map((role) => role.length);
    return Math.max(...lengths, 0);
  }, [roleList]);
  const [roleIndex, setRoleIndex] = useState(0);
  const [roleChanging, setRoleChanging] = useState(false);

  const initialVars = useMemo(
    () => ({
      "--mx": "50%",
      "--my": "35%",
      "--rx": "0px",
      "--ry": "0px",
      "--o": "0",
    }),
    [],
  );

  const applyVars = () => {
    rafRef.current = 0;
    const node = heroRef.current;
    if (!node) return;
    const { x, y, w, h } = lastRef.current;
    const px = `${Math.max(0, Math.min(100, (x / w) * 100)).toFixed(2)}%`;
    const py = `${Math.max(0, Math.min(100, (y / h) * 100)).toFixed(2)}%`;
    const rx = `${((x / w - 0.5) * 18).toFixed(2)}px`;
    const ry = `${((y / h - 0.5) * 18).toFixed(2)}px`;

    node.style.setProperty("--mx", px);
    node.style.setProperty("--my", py);
    node.style.setProperty("--rx", rx);
    node.style.setProperty("--ry", ry);
    node.style.setProperty("--o", "1");
  };

  const onMove = (e) => {
    const node = heroRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    lastRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      w: rect.width || 1,
      h: rect.height || 1,
    };
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(applyVars);
  };

  const onLeave = () => {
    const node = heroRef.current;
    if (!node) return;
    node.style.setProperty("--o", "0");
  };

  useEffect(() => {
    roleIntervalRef.current = window.setInterval(() => {
      setRoleChanging(true);
      if (roleTimerRef.current) window.clearTimeout(roleTimerRef.current);
      roleTimerRef.current = window.setTimeout(() => {
        setRoleIndex((current) => (current + 1) % roleList.length);
        setRoleChanging(false);
      }, 350);
    }, 2600);

    return () => {
      if (roleIntervalRef.current) window.clearInterval(roleIntervalRef.current);
      if (roleTimerRef.current) window.clearTimeout(roleTimerRef.current);
    };
  }, [roleList.length]);

  return (
    <div className="relative overflow-hidden">
      <div
        ref={heroRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={initialVars}
        className="relative mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
        >
          <div
            className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(148,163,184,0.45),transparent_60%)] blur-3xl opacity-40"
            style={{
              transform: "translate3d(var(--rx), var(--ry), 0)",
            }}
          />
          <div
            className="absolute -bottom-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(100,116,139,0.40),transparent_60%)] blur-3xl opacity-30"
            style={{
              transform: "translate3d(var(--rx), var(--ry), 0)",
            }}
          />
          <div
            className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(71,85,105,0.30),transparent_60%)] blur-3xl opacity-25"
            style={{
              transform: "translate3d(var(--rx), var(--ry), 0)",
            }}
          />

          <div
            className="absolute inset-0 bg-[radial-gradient(650px_circle_at_var(--mx)_var(--my),rgba(226,232,240,0.18),rgba(148,163,184,0.12),transparent_60%)] opacity-0 transition-opacity duration-300"
            style={{
              opacity: "var(--o)",
            }}
          />
        </div>

        <div className="relative">
          <p className="reveal inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium ring-1 ring-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            Available for opportunities
          </p>

          <h1 className="reveal mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 bg-clip-text text-transparent">
              {heroProfile.name}
            </span>
          </h1>

          <p
            className="reveal mt-3 text-lg font-semibold text-white/90 sm:text-xl"
            aria-live="polite"
          >
            <span
              className={`role-swap ${roleChanging ? "is-changing" : ""}`}
              style={{ minWidth: `${roleMinWidth}ch` }}
            >
              {roleList[roleIndex]}
            </span>
          </p>
          <p className="reveal mt-3 max-w-2xl text-base text-white/75 sm:text-lg">
            {heroProfile.tagline}
          </p>

          <dl className="reveal mt-6 grid max-w-2xl grid-cols-1 gap-3 text-sm text-white/80 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <dt className="text-xs uppercase tracking-wide text-white/60">
                Location
              </dt>
              <dd className="mt-1 font-medium text-white/90">{heroProfile.location}</dd>
            </div>
            <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
              <dt className="text-xs uppercase tracking-wide text-white/60">Email</dt>
              <dd className="mt-1 font-medium">
                <a
                  className="text-white/90 hover:text-white underline decoration-white/20 hover:decoration-white/40"
                  href={`mailto:${heroProfile.email}`}
                  aria-label="Email Nishchaya Sharma"
                >
                  {heroProfile.email}
                </a>
              </dd>
            </div>
          </dl>

          <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {showProjectsButton ? (
              <button
                type="button"
                onClick={() => onNavigate("projects")}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-110 focus:outline-none"
                aria-label="View projects"
              >
                View Projects
              </button>
            ) : null}
            <ActionButton href={resumeHref} ariaLabel="Open resume">
              Resume
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
