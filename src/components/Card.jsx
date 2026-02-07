import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "reveal group relative h-full rounded-2xl p-[1px]",
        "bg-gradient-to-br from-slate-200/25 via-zinc-200/15 to-gray-400/20",
        "transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_rgba(148,163,184,0.16)]",
        className,
      ].join(" ")}
    >
      <div className="relative h-full rounded-2xl bg-zinc-950/60 ring-1 ring-white/10 backdrop-blur">
        {children}
      </div>
    </div>
  );
}
