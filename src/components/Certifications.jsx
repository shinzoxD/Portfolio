import React from "react";
import Card from "./Card.jsx";
import { CERTIFICATIONS } from "../data/siteConfig.js";

function LinkOrPlaceholder({ href, children, ariaLabel }) {
  const classes =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold ring-1 ring-white/15 bg-white/5 hover:bg-white/10";

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

export default function Certifications({
  certifications,
  subtitle = "Verified learning milestones in machine learning, AI, and software engineering.",
}) {
  const list = Array.isArray(certifications) ? certifications : CERTIFICATIONS;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Certifications
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((cert, index) => (
          <Card key={`${cert.title}-${cert.issuer}-${index}`} className="h-full">
            <div className="flex h-full flex-col p-5">
              <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10 w-fit">
                {cert.year || "Certified"}
              </div>

              <h3 className="mt-4 text-lg font-bold text-white/95">
                {cert.title || "Certificate"}
              </h3>
              <p className="mt-2 text-sm text-white/75">
                {cert.issuer || "Issuer"}
              </p>

              <div className="mt-auto pt-6">
                <LinkOrPlaceholder
                  href={cert.credentialUrl}
                  ariaLabel={`View credential for ${cert.title || "certificate"}`}
                >
                  View Credential
                </LinkOrPlaceholder>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
