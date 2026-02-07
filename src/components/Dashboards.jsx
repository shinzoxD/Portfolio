import React from "react";
import Card from "./Card.jsx";
import { DASHBOARDS } from "../data/siteConfig.js";

function DashboardEmbed({ url, title }) {
  const isMissing = !url || url === "#";

  if (isMissing) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/30 p-6 text-center">
        <div>
          <p className="text-sm font-semibold">Dashboard URL missing</p>
          <p className="mt-2 text-sm text-white/70">
            Add an embed URL in <span className="font-medium">src/data/siteConfig.js</span>{" "}
            to display this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={url}
      loading="lazy"
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      referrerPolicy="no-referrer"
      className="h-[320px] w-full rounded-xl border border-white/10 bg-black"
    />
  );
}

export default function Dashboards() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboards
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
          Fast, scannable views for KPIs, funnels, and operational health.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {DASHBOARDS.map((dash) => (
          <Card key={dash.title} className="h-full">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold leading-snug">{dash.title}</h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                  {dash.type}
                </span>
              </div>
              <div className="mt-5">
                <DashboardEmbed url={dash.url} title={dash.title} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
