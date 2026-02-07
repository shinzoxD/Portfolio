import React from "react";
import Card from "./Card.jsx";
import { PROJECTS } from "../data/siteConfig.js";

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

function TypeBadge({ type }) {
  const label = type && type.trim().length > 0 ? type : "Project";
  return (
    <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
      {label}
    </span>
  );
}

export default function Projects({
  projects,
  showViewAll = true,
  showBack = false,
  title = "Projects",
  subtitle = "A mix of analytics work and developer builds with clean UI and measurable outcomes.",
}) {
  const list = Array.isArray(projects) ? projects : PROJECTS;
  const hasActions = showViewAll || showBack;
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
            {subtitle}
          </p>
        </div>
        {hasActions ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {showBack ? (
              <a
                href="#"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                aria-label="Back to home"
              >
                Back to Home
              </a>
            ) : null}
            {showViewAll ? (
              <a
                href="#/projects"
                className="inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                aria-label="View all projects"
              >
                View All Projects
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((project, index) => (
          <Card key={`${project.title}-${index}`} className="h-full">
            <div className="flex h-full flex-col p-5">
              <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-black ring-1 ring-white/10">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(160px_circle_at_20%_20%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(180px_circle_at_80%_30%,rgba(255,255,255,0.06),transparent_55%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_40%,rgba(255,255,255,0.03))]"
                />
                <div className="relative flex h-full items-center justify-between px-4">
                  <span className="text-xs font-semibold tracking-wide text-white/70">
                    {project.type && project.type.trim().length > 0
                      ? project.type
                      : "Project"}
                  </span>
                  <span className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10" />
                </div>
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold leading-snug">{project.title}</h3>
                <TypeBadge type={project.type} />
              </div>

              <p className="mt-3 text-sm text-white/75">{project.blurb}</p>
              <p className="mt-3 text-sm text-white/80">
                <span className="font-semibold text-white/90">Impact:</span>{" "}
                {project.impact}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-5">
                <div className="grid grid-cols-2 gap-3">
                  <LinkOrPlaceholder
                    href={project.links.demo}
                    ariaLabel={`Open demo for ${project.title}`}
                  >
                    Demo
                  </LinkOrPlaceholder>
                  <LinkOrPlaceholder
                    href={project.links.repo}
                    ariaLabel={`Open repository for ${project.title}`}
                  >
                    Repo
                  </LinkOrPlaceholder>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
