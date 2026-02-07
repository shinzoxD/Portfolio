import React from "react";
import { ABOUT_CONTENT, PROFILE } from "../data/siteConfig.js";

function LinkOrPlaceholder({ href, children, ariaLabel }) {
  const classes =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-white/15 bg-white/5 hover:bg-white/10";

  if (href && href !== "#") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={classes} role="link" aria-disabled="true" aria-label={ariaLabel}>
      {children}
    </span>
  );
}

const ACCENTS = [
  "from-slate-200 via-zinc-200 to-gray-400",
  "from-zinc-300 via-gray-300 to-slate-400",
  "from-neutral-300 via-stone-200 to-zinc-400",
  "from-slate-200 via-slate-200 to-zinc-300",
];

export default function About({
  resumeHref,
  profile,
  aboutContent,
  subtitle = "",
}) {
  const aboutProfile = profile && typeof profile === "object" ? profile : PROFILE;
  const about = aboutContent && typeof aboutContent === "object" ? aboutContent : ABOUT_CONTENT;
  const cards = Array.isArray(about.cards) ? about.cards : [];
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">About</h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">{subtitle}</p>
        ) : null}
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
          {about.paragraph}
        </p>
      </div>

      {cards.length > 0 ? (
        <div className="reveal mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <div key={`${card.title}-${index}`} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-white/95">{card.title}</p>
                <span
                  aria-hidden="true"
                  className={`h-2 w-12 rounded-full bg-gradient-to-r ${ACCENTS[index % ACCENTS.length]}`}
                />
              </div>
              <p className="mt-3 text-sm text-white/70">{card.body}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <LinkOrPlaceholder href={resumeHref} ariaLabel="Open resume">
          Resume
        </LinkOrPlaceholder>
        <LinkOrPlaceholder href={aboutProfile.github} ariaLabel="Open GitHub profile">
          GitHub
        </LinkOrPlaceholder>
        <LinkOrPlaceholder href={aboutProfile.linkedin} ariaLabel="Open LinkedIn profile">
          LinkedIn
        </LinkOrPlaceholder>
      </div>

      {/* Resume upload is available only in the Admin panel */}
    </div>
  );
}
