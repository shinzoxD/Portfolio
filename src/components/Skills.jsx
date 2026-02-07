import React from "react";
import Card from "./Card.jsx";
import { SKILL_GROUPS } from "../data/siteConfig.js";

const ACCENTS = [
  "from-slate-200 via-zinc-200 to-gray-400",
  "from-zinc-300 via-gray-300 to-slate-400",
  "from-neutral-300 via-stone-200 to-zinc-400",
  "from-slate-200 via-slate-200 to-zinc-300",
  "from-zinc-300 via-slate-200 to-gray-400",
];

function SkillPill({ label }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-200/15 via-zinc-200/10 to-gray-400/15 px-4 py-2 text-sm font-semibold text-white/85 ring-1 ring-white/10 transition hover:from-slate-200/25 hover:via-zinc-200/20 hover:to-gray-400/25 hover:ring-white/20">
      {label}
    </span>
  );
}

export default function Skills({
  skillGroups,
  subtitle = "My toolkit for building machine learning models and shipping them into real products.",
}) {
  const groups = Array.isArray(skillGroups) && skillGroups.length > 0 ? skillGroups : SKILL_GROUPS;
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Skills</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, index) => (
          <Card key={group.title} className="h-full">
            <div className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white/95">{group.title}</h3>
                  <p className="mt-1 text-sm text-white/65">{group.blurb}</p>
                </div>
                <span
                  aria-hidden="true"
                  className={`mt-1 h-2 w-14 rounded-full bg-gradient-to-r ${ACCENTS[index % ACCENTS.length]}`}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((label) => (
                  <SkillPill key={`${group.title}-${label}`} label={label} />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
