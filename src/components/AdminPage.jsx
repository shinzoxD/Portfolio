import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ABOUT_CONTENT,
  CERTIFICATIONS,
  EDUCATION,
  EXPERIENCE,
  HERO_ROLES,
  PROFILE,
  PROJECTS,
  SECTION_SUBTITLES,
  SECTION_VISIBILITY,
  SKILL_GROUPS,
} from "../data/siteConfig.js";

const SECTION_OPTIONS = [
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "about", label: "About" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "contact", label: "Contact" },
];

const ADMIN_SESSION_STORAGE_KEY = "portfolio_admin_session";

function parseCsv(text) {
  if (typeof text !== "string") return [];
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseLines(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function toCsv(list) {
  return Array.isArray(list) ? list.join(", ") : "";
}

function toLines(list) {
  return Array.isArray(list) ? list.join("\n") : "";
}

function inputClass() {
  return "mt-2 w-full rounded-lg bg-black/40 px-3 py-2 text-sm text-white ring-1 ring-white/10 placeholder:text-white/40 focus:ring-slate-400/50";
}

function blockClass() {
  return "rounded-2xl bg-white/5 p-5 ring-1 ring-white/10";
}

function labelClass() {
  return "text-xs font-semibold uppercase tracking-wide text-white/60";
}

function buildDefaultDrafts() {
  return {
    profile: { ...PROFILE },
    heroRolesText: HERO_ROLES.join(", "),
    aboutParagraph: ABOUT_CONTENT.paragraph,
    aboutCards: ABOUT_CONTENT.cards.map((item) => ({ ...item })),
    skillGroups: SKILL_GROUPS.map((group) => ({
      ...group,
      itemsText: toCsv(group.items),
    })),
    experience: EXPERIENCE.map((item) => ({
      ...item,
      bulletsText: toLines(item.bullets),
    })),
    education: EDUCATION.map((item) => ({ ...item })),
    projects: PROJECTS.map((item) => ({
      ...item,
      tagsText: toCsv(item.tags),
      demo: item.links.demo,
      repo: item.links.repo,
    })),
    certifications: CERTIFICATIONS.map((item) => ({ ...item })),
    sectionVisibility: { ...SECTION_VISIBILITY },
    sectionSubtitles: { ...SECTION_SUBTITLES },
  };
}

export default function AdminPage({
  profile,
  heroRoles,
  aboutContent,
  skillGroups,
  experience,
  education,
  projects,
  certifications,
  sectionVisibility,
  sectionSubtitles,
  resumeHref,
  isAdmin,
  onAdminChange,
  onSaveAllContent,
  onSaveResumeFile,
  onGoHome,
}) {
  const defaults = useMemo(() => buildDefaultDrafts(), []);

  const [profileDraft, setProfileDraft] = useState(profile || defaults.profile);
  const [heroRolesText, setHeroRolesText] = useState(
    Array.isArray(heroRoles) ? heroRoles.join(", ") : defaults.heroRolesText,
  );
  const [aboutParagraph, setAboutParagraph] = useState(
    aboutContent && typeof aboutContent.paragraph === "string"
      ? aboutContent.paragraph
      : defaults.aboutParagraph,
  );
  const [aboutCards, setAboutCards] = useState(
    aboutContent && Array.isArray(aboutContent.cards)
      ? aboutContent.cards.map((item) => ({ ...item }))
      : defaults.aboutCards,
  );
  const [skillDrafts, setSkillDrafts] = useState(
    Array.isArray(skillGroups)
      ? skillGroups.map((group) => ({ ...group, itemsText: toCsv(group.items) }))
      : defaults.skillGroups,
  );
  const [experienceDrafts, setExperienceDrafts] = useState(
    Array.isArray(experience)
      ? experience.map((item) => ({ ...item, bulletsText: toLines(item.bullets) }))
      : defaults.experience,
  );
  const [educationDrafts, setEducationDrafts] = useState(
    Array.isArray(education) ? education.map((item) => ({ ...item })) : defaults.education,
  );
  const [projectDrafts, setProjectDrafts] = useState(
    Array.isArray(projects)
      ? projects.map((item) => ({
          ...item,
          tagsText: toCsv(item.tags),
          demo: item.links && item.links.demo ? item.links.demo : "#",
          repo: item.links && item.links.repo ? item.links.repo : "#",
        }))
      : defaults.projects,
  );
  const [certDrafts, setCertDrafts] = useState(
    Array.isArray(certifications)
      ? certifications.map((item) => ({ ...item }))
      : defaults.certifications,
  );
  const [visibilityDraft, setVisibilityDraft] = useState(
    sectionVisibility && typeof sectionVisibility === "object"
      ? { ...sectionVisibility }
      : defaults.sectionVisibility,
  );
  const [sectionSubtitlesDraft, setSectionSubtitlesDraft] = useState(
    sectionSubtitles && typeof sectionSubtitles === "object"
      ? { ...sectionSubtitles }
      : defaults.sectionSubtitles,
  );

  const [authChecking, setAuthChecking] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return globalThis.sessionStorage
        ? globalThis.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || ""
        : "";
    } catch (error) {
      return "";
    }
  });

  const persistAdminToken = useCallback((value) => {
    try {
      if (!globalThis.sessionStorage) return;
      if (value) {
        globalThis.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, value);
        return;
      }
      globalThis.sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch (error) {
      // Ignore storage errors and keep cookie-based auth path.
    }
  }, []);

  useEffect(() => {
    setProfileDraft(profile || defaults.profile);
    setHeroRolesText(Array.isArray(heroRoles) ? heroRoles.join(", ") : defaults.heroRolesText);
    setAboutParagraph(
      aboutContent && typeof aboutContent.paragraph === "string"
        ? aboutContent.paragraph
        : defaults.aboutParagraph,
    );
    setAboutCards(
      aboutContent && Array.isArray(aboutContent.cards)
        ? aboutContent.cards.map((item) => ({ ...item }))
        : defaults.aboutCards,
    );
    setSkillDrafts(
      Array.isArray(skillGroups)
        ? skillGroups.map((group) => ({ ...group, itemsText: toCsv(group.items) }))
        : defaults.skillGroups,
    );
    setExperienceDrafts(
      Array.isArray(experience)
        ? experience.map((item) => ({ ...item, bulletsText: toLines(item.bullets) }))
        : defaults.experience,
    );
    setEducationDrafts(
      Array.isArray(education) ? education.map((item) => ({ ...item })) : defaults.education,
    );
    setProjectDrafts(
      Array.isArray(projects)
        ? projects.map((item) => ({
            ...item,
            tagsText: toCsv(item.tags),
            demo: item.links && item.links.demo ? item.links.demo : "#",
            repo: item.links && item.links.repo ? item.links.repo : "#",
          }))
        : defaults.projects,
    );
    setCertDrafts(
      Array.isArray(certifications)
        ? certifications.map((item) => ({ ...item }))
        : defaults.certifications,
    );
    setVisibilityDraft(
      sectionVisibility && typeof sectionVisibility === "object"
        ? { ...sectionVisibility }
        : defaults.sectionVisibility,
    );
    setSectionSubtitlesDraft(
      sectionSubtitles && typeof sectionSubtitles === "object"
        ? { ...sectionSubtitles }
        : defaults.sectionSubtitles,
    );
  }, [
    aboutContent,
    certifications,
    defaults,
    education,
    experience,
    heroRoles,
    profile,
    projects,
    sectionSubtitles,
    sectionVisibility,
    skillGroups,
  ]);

  const checkSession = useCallback(async () => {
    setAuthChecking(true);
    try {
      const headers = {};
      if (adminToken) headers["X-Admin-Session"] = adminToken;
      const res = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onAdminChange(false);
        setAdminToken("");
        persistAdminToken("");
        setError(
          data && typeof data.message === "string" && data.message.trim()
            ? data.message
            : "Admin session is unavailable.",
        );
        return;
      }
      onAdminChange(Boolean(data.authenticated));
      if (!data.authenticated) {
        setAdminToken("");
        persistAdminToken("");
      }
    } catch (networkError) {
      onAdminChange(false);
      setError("Admin API is not reachable.");
    } finally {
      setAuthChecking(false);
    }
  }, [adminToken, onAdminChange, persistAdminToken]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const unlock = async () => {
    if (!passcode.trim()) {
      setError("Enter your passcode.");
      return;
    }
    setAuthBusy(true);
    setError("");
    setFeedback("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data && typeof data.message === "string" && data.message.trim()
            ? data.message
            : "Invalid passcode.",
        );
        onAdminChange(false);
        setAdminToken("");
        persistAdminToken("");
        return;
      }
      const token =
        data && typeof data.sessionToken === "string" ? data.sessionToken.trim() : "";
      setAdminToken(token);
      persistAdminToken(token);
      onAdminChange(true);
      setPasscode("");
      setFeedback("Admin unlocked.");
    } catch (networkError) {
      onAdminChange(false);
      setAdminToken("");
      persistAdminToken("");
      setError("Could not reach admin login API.");
    } finally {
      setAuthBusy(false);
    }
  };

  const lock = async () => {
    setAuthBusy(true);
    try {
      const headers = {};
      if (adminToken) headers["X-Admin-Session"] = adminToken;
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
        headers,
      });
    } catch (networkError) {
      // Best effort.
    } finally {
      onAdminChange(false);
      setAdminToken("");
      persistAdminToken("");
      setAuthBusy(false);
    }
  };

  const saveAll = async () => {
    setSaveBusy(true);
    setError("");
    setFeedback("");
    try {
      const payload = {
        profile: profileDraft,
        heroRoles: parseCsv(heroRolesText),
        about: { paragraph: aboutParagraph, cards: aboutCards },
        skillGroups: skillDrafts.map((group) => ({
          title: group.title,
          blurb: group.blurb,
          items: parseCsv(group.itemsText),
        })),
        experience: experienceDrafts.map((item) => ({
          role: item.role,
          company: item.company,
          location: item.location,
          period: item.period,
          bullets: parseLines(item.bulletsText),
        })),
        education: educationDrafts,
        projects: projectDrafts.map((item) => ({
          title: item.title,
          type: item.type,
          blurb: item.blurb,
          impact: item.impact,
          tags: parseCsv(item.tagsText),
          links: { demo: item.demo, repo: item.repo },
        })),
        certifications: certDrafts,
        sectionVisibility: visibilityDraft,
        sectionSubtitles: sectionSubtitlesDraft,
      };

      await onSaveAllContent(payload);
      setFeedback("All sections saved.");
    } catch (saveError) {
      const message =
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Could not save content.";
      if (message.toLowerCase().includes("unauthorized admin session")) {
        onAdminChange(false);
        setAdminToken("");
        persistAdminToken("");
        setError("Admin session expired. Unlock admin again.");
        return;
      }
      setError(
        message,
      );
    } finally {
      setSaveBusy(false);
    }
  };

  const uploadResume = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setResumeBusy(true);
    setError("");
    setFeedback("");
    try {
      await onSaveResumeFile(file);
      setFeedback("Resume uploaded.");
    } catch (uploadError) {
      const message =
        uploadError instanceof Error && uploadError.message
          ? uploadError.message
          : "Could not upload resume.";
      if (message.toLowerCase().includes("unauthorized admin session")) {
        onAdminChange(false);
        setAdminToken("");
        persistAdminToken("");
        setError("Admin session expired. Unlock admin again.");
        return;
      }
      setError(
        message,
      );
    } finally {
      setResumeBusy(false);
      event.target.value = "";
    }
  };

  const loadDefaultsInEditor = () => {
    const next = buildDefaultDrafts();
    setProfileDraft(next.profile);
    setHeroRolesText(next.heroRolesText);
    setAboutParagraph(next.aboutParagraph);
    setAboutCards(next.aboutCards);
    setSkillDrafts(next.skillGroups);
    setExperienceDrafts(next.experience);
    setEducationDrafts(next.education);
    setProjectDrafts(next.projects);
    setCertDrafts(next.certifications);
    setVisibilityDraft(next.sectionVisibility);
    setSectionSubtitlesDraft(next.sectionSubtitles);
    setError("");
    setFeedback("Default values loaded. Click Save All to publish.");
  };

  const authLabel = useMemo(() => {
    if (authChecking) return "Checking admin session...";
    return isAdmin ? "Authenticated" : "Locked";
  }, [authChecking, isAdmin]);

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Console</h2>
            <p className="mt-2 text-sm text-white/70">
              Edit intro, about, skills, experience, education, projects, certifications,
              and section visibility.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 ring-1 ring-white/10">
              {authLabel}
            </span>
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              aria-label="Back to portfolio"
            >
              Back to Portfolio
            </button>
          </div>
        </div>
      </div>

      {!isAdmin ? (
        <div className={`${blockClass()} mt-8 max-w-xl`}>
          <label className={labelClass()}>
            Admin Passcode
            <input
              className={inputClass()}
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
            />
          </label>
          <button
            type="button"
            onClick={unlock}
            disabled={authBusy}
            className="mt-4 rounded-xl bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 px-4 py-2 text-xs font-semibold text-black hover:brightness-110 disabled:opacity-70"
          >
            {authBusy ? "Unlocking..." : "Unlock Admin"}
          </button>
          {error ? <p className="mt-3 text-xs font-semibold text-slate-300">{error}</p> : null}
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <section className={blockClass()}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Section Visibility
              </p>
              <button
                type="button"
                onClick={lock}
                disabled={authBusy}
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-70"
              >
                {authBusy ? "Locking..." : "Lock Admin"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {SECTION_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm text-white/85 ring-1 ring-white/10"
                >
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(visibilityDraft[option.key])}
                    onChange={(e) =>
                      setVisibilityDraft((prev) => ({
                        ...prev,
                        [option.key]: e.target.checked,
                      }))
                    }
                    aria-label={`Toggle ${option.label} section`}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Section Subtitles
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { key: "projects", label: "Projects subtitle" },
                { key: "projectsAll", label: "All Projects subtitle" },
                { key: "skills", label: "Skills subtitle" },
                { key: "about", label: "About subtitle" },
                { key: "experience", label: "Experience subtitle" },
                { key: "education", label: "Education subtitle" },
                { key: "certifications", label: "Certifications subtitle" },
                { key: "contact", label: "Contact subtitle" },
              ].map((field) => (
                <label key={field.key} className={labelClass()}>
                  {field.label}
                  <input
                    className={inputClass()}
                    value={sectionSubtitlesDraft[field.key] || ""}
                    onChange={(e) =>
                      setSectionSubtitlesDraft((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
              Hero and Intro
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={labelClass()}>
                Name
                <input
                  className={inputClass()}
                  value={profileDraft.name || ""}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label className={labelClass()}>
                Tagline
                <input
                  className={inputClass()}
                  value={profileDraft.tagline || ""}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, tagline: e.target.value }))}
                />
              </label>
              <label className={labelClass()}>
                Location
                <input
                  className={inputClass()}
                  value={profileDraft.location || ""}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </label>
              <label className={labelClass()}>
                Email
                <input
                  className={inputClass()}
                  value={profileDraft.email || ""}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
                />
              </label>
              <label className={labelClass()}>
                GitHub URL
                <input
                  className={inputClass()}
                  value={profileDraft.github || ""}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, github: e.target.value }))}
                />
              </label>
              <label className={labelClass()}>
                LinkedIn URL
                <input
                  className={inputClass()}
                  value={profileDraft.linkedin || ""}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, linkedin: e.target.value }))
                  }
                />
              </label>
              <label className={labelClass()}>
                Resume URL (fallback)
                <input
                  className={inputClass()}
                  value={profileDraft.resumeUrl || ""}
                  onChange={(e) =>
                    setProfileDraft((prev) => ({ ...prev, resumeUrl: e.target.value }))
                  }
                  placeholder="https://drive.google.com/... or #"
                />
              </label>
            </div>
            <label className={`${labelClass()} mt-4 block`}>
              Animated Roles (comma separated)
              <input
                className={inputClass()}
                value={heroRolesText}
                onChange={(e) => setHeroRolesText(e.target.value)}
                placeholder="Data Scientist, ML Engineer, AI Engineer"
              />
            </label>
            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10">
                <span>{resumeBusy ? "Uploading..." : "Upload or Replace Resume PDF"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={resumeBusy}
                  onChange={uploadResume}
                />
              </label>
              <p className="mt-2 text-xs text-white/65">
                Current resume:{" "}
                {resumeHref && resumeHref !== "#" ? "uploaded and active" : "not uploaded"}
              </p>
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">About</p>
              <button
                type="button"
                onClick={() => setAboutCards((prev) => [...prev, { title: "", body: "" }])}
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Card
              </button>
            </div>
            <label className={`${labelClass()} mt-4 block`}>
              About Paragraph
              <textarea
                className={`${inputClass()} min-h-[120px]`}
                value={aboutParagraph}
                onChange={(e) => setAboutParagraph(e.target.value)}
              />
            </label>
            <div className="mt-4 space-y-3">
              {aboutCards.map((card, index) => (
                <div key={`about-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className={labelClass()}>
                      Card Title
                      <input
                        className={inputClass()}
                        value={card.title || ""}
                        onChange={(e) =>
                          setAboutCards((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, title: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                        onClick={() =>
                          setAboutCards((prev) => prev.filter((_, idx) => idx !== index))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <label className={`${labelClass()} mt-3 block`}>
                    Description
                    <textarea
                      className={`${inputClass()} min-h-[88px]`}
                      value={card.body || ""}
                      onChange={(e) =>
                        setAboutCards((prev) =>
                          prev.map((item, idx) =>
                            idx === index ? { ...item, body: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Skills</p>
              <button
                type="button"
                onClick={() =>
                  setSkillDrafts((prev) => [...prev, { title: "", blurb: "", itemsText: "" }])
                }
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Group
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {skillDrafts.map((group, index) => (
                <div key={`skill-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className={labelClass()}>
                      Title
                      <input
                        className={inputClass()}
                        value={group.title || ""}
                        onChange={(e) =>
                          setSkillDrafts((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, title: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className={labelClass()}>
                      Subtitle
                      <input
                        className={inputClass()}
                        value={group.blurb || ""}
                        onChange={(e) =>
                          setSkillDrafts((prev) =>
                            prev.map((item, idx) =>
                              idx === index ? { ...item, blurb: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className={`${labelClass()} mt-3 block`}>
                    Items (comma separated)
                    <input
                      className={inputClass()}
                      value={group.itemsText || ""}
                      onChange={(e) =>
                        setSkillDrafts((prev) =>
                          prev.map((item, idx) =>
                            idx === index ? { ...item, itemsText: e.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() =>
                        setSkillDrafts((prev) => prev.filter((_, idx) => idx !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Experience
              </p>
              <button
                type="button"
                onClick={() =>
                  setExperienceDrafts((prev) => [
                    ...prev,
                    { role: "", company: "", period: "", location: "", bulletsText: "" },
                  ])
                }
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Experience
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {experienceDrafts.map((item, index) => (
                <div key={`exp-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className={labelClass()}>
                      Role
                      <input
                        className={inputClass()}
                        value={item.role || ""}
                        onChange={(e) =>
                          setExperienceDrafts((prev) =>
                            prev.map((entry, idx) =>
                              idx === index ? { ...entry, role: e.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className={labelClass()}>
                      Company
                      <input
                        className={inputClass()}
                        value={item.company || ""}
                        onChange={(e) =>
                          setExperienceDrafts((prev) =>
                            prev.map((entry, idx) =>
                              idx === index ? { ...entry, company: e.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className={labelClass()}>
                      Location
                      <input
                        className={inputClass()}
                        value={item.location || ""}
                        onChange={(e) =>
                          setExperienceDrafts((prev) =>
                            prev.map((entry, idx) =>
                              idx === index ? { ...entry, location: e.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </label>
                    <label className={labelClass()}>
                      Duration
                      <input
                        className={inputClass()}
                        value={item.period || ""}
                        onChange={(e) =>
                          setExperienceDrafts((prev) =>
                            prev.map((entry, idx) =>
                              idx === index ? { ...entry, period: e.target.value } : entry,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                  <label className={`${labelClass()} mt-3 block`}>
                    Bullets (one per line)
                    <textarea
                      className={`${inputClass()} min-h-[92px]`}
                      value={item.bulletsText || ""}
                      onChange={(e) =>
                        setExperienceDrafts((prev) =>
                          prev.map((entry, idx) =>
                            idx === index ? { ...entry, bulletsText: e.target.value } : entry,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() =>
                        setExperienceDrafts((prev) => prev.filter((_, idx) => idx !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Education
              </p>
              <button
                type="button"
                onClick={() =>
                  setEducationDrafts((prev) => [
                    ...prev,
                    {
                      school: "",
                      degree: "",
                      period: "",
                      details: "",
                      typeLabel: "",
                      location: "",
                      imageUrl: "",
                      imageAlt: "",
                    },
                  ])
                }
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Education
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {educationDrafts.map((item, index) => (
                <div key={`edu-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {["school", "degree", "period", "typeLabel", "location", "imageUrl", "imageAlt"].map(
                      (field) => (
                        <label key={`${field}-${index}`} className={labelClass()}>
                          {field}
                          <input
                            className={inputClass()}
                            value={item[field] || ""}
                            onChange={(e) =>
                              setEducationDrafts((prev) =>
                                prev.map((entry, idx) =>
                                  idx === index ? { ...entry, [field]: e.target.value } : entry,
                                ),
                              )
                            }
                          />
                        </label>
                      ),
                    )}
                  </div>
                  <label className={`${labelClass()} mt-3 block`}>
                    Details
                    <textarea
                      className={`${inputClass()} min-h-[90px]`}
                      value={item.details || ""}
                      onChange={(e) =>
                        setEducationDrafts((prev) =>
                          prev.map((entry, idx) =>
                            idx === index ? { ...entry, details: e.target.value } : entry,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() =>
                        setEducationDrafts((prev) => prev.filter((_, idx) => idx !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Projects
              </p>
              <button
                type="button"
                onClick={() =>
                  setProjectDrafts((prev) => [
                    ...prev,
                    {
                      title: "",
                      type: "",
                      blurb: "",
                      impact: "",
                      tagsText: "",
                      demo: "#",
                      repo: "#",
                    },
                  ])
                }
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Project
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {projectDrafts.map((item, index) => (
                <div key={`proj-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {["title", "type", "demo", "repo", "tagsText"].map((field) => (
                      <label key={`${field}-${index}`} className={labelClass()}>
                        {field}
                        <input
                          className={inputClass()}
                          value={item[field] || ""}
                          onChange={(e) =>
                            setProjectDrafts((prev) =>
                              prev.map((entry, idx) =>
                                idx === index ? { ...entry, [field]: e.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label className={`${labelClass()} mt-3 block`}>
                    Blurb
                    <textarea
                      className={`${inputClass()} min-h-[80px]`}
                      value={item.blurb || ""}
                      onChange={(e) =>
                        setProjectDrafts((prev) =>
                          prev.map((entry, idx) =>
                            idx === index ? { ...entry, blurb: e.target.value } : entry,
                          ),
                        )
                      }
                    />
                  </label>
                  <label className={`${labelClass()} mt-3 block`}>
                    Impact
                    <textarea
                      className={`${inputClass()} min-h-[80px]`}
                      value={item.impact || ""}
                      onChange={(e) =>
                        setProjectDrafts((prev) =>
                          prev.map((entry, idx) =>
                            idx === index ? { ...entry, impact: e.target.value } : entry,
                          ),
                        )
                      }
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() =>
                        setProjectDrafts((prev) => prev.filter((_, idx) => idx !== index))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={blockClass()}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                Certifications
              </p>
              <button
                type="button"
                onClick={() =>
                  setCertDrafts((prev) => [
                    ...prev,
                    { title: "", issuer: "", year: "", credentialUrl: "#" },
                  ])
                }
                className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
              >
                Add Certificate
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {certDrafts.map((item, index) => (
                <div key={`cert-${index}`} className="rounded-xl bg-black/30 p-4 ring-1 ring-white/10">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {["title", "issuer", "year", "credentialUrl"].map((field) => (
                      <label key={`${field}-${index}`} className={labelClass()}>
                        {field}
                        <input
                          className={inputClass()}
                          value={item[field] || ""}
                          onChange={(e) =>
                            setCertDrafts((prev) =>
                              prev.map((entry, idx) =>
                                idx === index ? { ...entry, [field]: e.target.value } : entry,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
                      onClick={() => setCertDrafts((prev) => prev.filter((_, idx) => idx !== index))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveAll}
              disabled={saveBusy}
              className="rounded-xl bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-70"
            >
              {saveBusy ? "Saving..." : "Save All Changes"}
            </button>
            <button
              type="button"
              onClick={loadDefaultsInEditor}
              className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10"
            >
              Load Defaults
            </button>
          </div>

          {error ? <p className="text-sm font-semibold text-slate-300">{error}</p> : null}
          {feedback ? <p className="text-sm font-semibold text-white/70">{feedback}</p> : null}
        </div>
      )}
    </div>
  );
}
