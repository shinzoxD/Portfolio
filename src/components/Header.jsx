import React, { useEffect, useMemo, useState } from "react";

function HamburgerIcon({ open }) {
  const common =
    "block h-0.5 w-6 rounded-full bg-white transition-transform duration-200";
  return (
    <span aria-hidden="true" className="relative inline-flex h-5 w-6 items-center">
      <span
        className={`${common} absolute ${open ? "translate-y-0 rotate-45" : "-translate-y-2"}`}
      />
      <span className={`${common} absolute ${open ? "opacity-0" : "opacity-100"}`} />
      <span
        className={`${common} absolute ${open ? "translate-y-0 -rotate-45" : "translate-y-2"}`}
      />
    </span>
  );
}

export default function Header({
  activeSection,
  hasShadow,
  onNavigate,
  onAdminNavigate,
  sections,
}) {
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () =>
      sections.map((id) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1),
      })),
    [sections],
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNav = (id) => {
    setOpen(false);
    window.requestAnimationFrame(() => onNavigate(id));
  };

  return (
    <div className="pointer-events-auto">
      <div
        id="header-bar"
        className={[
          "w-full border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40",
          hasShadow ? "shadow-neon" : "",
        ].join(" ")}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-left"
            aria-label="Go to home section"
          >
            <span className="text-sm font-semibold tracking-wide">
              <span className="bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 bg-clip-text text-transparent">
                Nishchaya
              </span>{" "}
              Sharma
            </span>
          </button>

          <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={[
                  "nav-link rounded-lg px-2 py-1 text-sm font-medium text-white/80 hover:text-white transition-colors",
                  activeSection === item.id ? "is-active text-white" : "",
                ].join(" ")}
                aria-label={`Go to ${item.label} section`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onAdminNavigate}
              className="rounded-lg bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Open admin page"
            >
              Admin
            </button>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={[
          "md:hidden overflow-hidden border-b border-white/10 bg-black/80 backdrop-blur",
          "transition-[max-height,opacity] duration-300",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6" aria-label="Mobile">
          <div className="flex flex-col">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                className={[
                  "mobile-nav-link w-full rounded-lg py-3 pl-5 pr-3 text-left text-sm font-medium text-white/80 hover:text-white hover:bg-white/5",
                  activeSection === item.id ? "is-active text-white" : "",
                ].join(" ")}
                aria-label={`Go to ${item.label} section`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (typeof onAdminNavigate === "function") onAdminNavigate();
              }}
              className="w-full rounded-lg py-3 pl-5 pr-3 text-left text-sm font-semibold text-white/85 hover:bg-white/5"
              aria-label="Open admin page"
            >
              Admin
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
