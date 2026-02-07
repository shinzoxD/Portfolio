import React from "react";
import { EXPERIENCE } from "../data/siteConfig.js";

export default function Experience({
  experience,
  subtitle = "Roles where I shipped insights, dashboards, and analysis workflows.",
}) {
  const timeline = Array.isArray(experience) ? experience : EXPERIENCE;
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Experience
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-10">
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-slate-200/40 via-zinc-200/30 to-gray-400/30"
          />

          <div className="space-y-8">
            {timeline.map((item) => (
              <div key={`${item.company}-${item.role}`} className="reveal relative pl-12">
                <div
                  aria-hidden="true"
                  className="absolute left-[0.625rem] top-3 h-3 w-3 rounded-full bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
                />

                <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white/95">
                        {item.role}{" "}
                        <span className="font-semibold text-white/70">
                          at {item.company}
                        </span>
                      </h3>
                      <p className="mt-1 text-sm text-white/70">{item.location}</p>
                    </div>
                    {item.period ? (
                      <p className="text-sm font-semibold text-white/75">
                        {item.period}
                      </p>
                    ) : null}
                  </div>

                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-white/75">
                    {item.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
