import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Projects from "./components/Projects.jsx";
import Skills from "./components/Skills.jsx";
import About from "./components/About.jsx";
import Experience from "./components/Experience.jsx";
import Education from "./components/Education.jsx";
import Certifications from "./components/Certifications.jsx";
import ContactForm from "./components/ContactForm.jsx";
import AdminPage from "./components/AdminPage.jsx";
import { getDefaultContent, normalizeStoredContent } from "./utils/content.js";

const PDF_DATA_URL_PREFIX = "data:application/pdf;base64,";

const ALL_SECTION_IDS = [
  "home",
  "projects",
  "skills",
  "about",
  "experience",
  "education",
  "certifications",
  "contact",
];

const BOOTSTRAP_PLACEHOLDER = "__PORTFOLIO_BOOTSTRAP__";

function getHeaderOffset() {
  const headerBar = document.getElementById("header-bar");
  if (!headerBar) return 0;
  return Math.ceil(headerBar.getBoundingClientRect().height);
}

function smoothScrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const y = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() + 1;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function normalizeHref(value) {
  if (typeof value !== "string") return "#";
  const text = value.trim();
  return text || "#";
}

function isPdfDataUrl(value) {
  return value.startsWith(PDF_DATA_URL_PREFIX);
}

function createPdfBlobUrl(dataUrl) {
  const base64 = dataUrl.slice(PDF_DATA_URL_PREFIX.length).replace(/\s/g, "");
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

function readBootstrappedContent() {
  if (typeof document !== "object") return null;
  const node = document.getElementById("portfolio-bootstrap");
  if (!node) return null;

  const text = typeof node.textContent === "string" ? node.textContent.trim() : "";
  if (!text || text === BOOTSTRAP_PLACEHOLDER) return null;

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

export default function App() {
  const defaults = useMemo(() => getDefaultContent(), []);
  const initialState = useMemo(() => {
    const raw = readBootstrappedContent();
    if (!raw) {
      return {
        content: defaults,
        resumeHref: defaults.profile.resumeUrl,
        ready: false,
      };
    }

    const normalized = normalizeStoredContent(raw);
    return {
      content: normalized,
      resumeHref:
        typeof raw.resumeDataUrl === "string" && raw.resumeDataUrl.trim()
          ? raw.resumeDataUrl.trim()
          : normalized.profile.resumeUrl || "#",
      ready: true,
    };
  }, [defaults]);

  const [activeSection, setActiveSection] = useState("home");
  const [hasShadow, setHasShadow] = useState(false);
  const [view, setView] = useState("home");
  const [pendingScroll, setPendingScroll] = useState("");
  const previousViewRef = useRef("home");

  const [profile, setProfile] = useState(initialState.content.profile);
  const [heroRoles, setHeroRoles] = useState(initialState.content.heroRoles);
  const [aboutContent, setAboutContent] = useState(initialState.content.about);
  const [skillGroups, setSkillGroups] = useState(initialState.content.skillGroups);
  const [experience, setExperience] = useState(initialState.content.experience);
  const [education, setEducation] = useState(initialState.content.education);
  const [projects, setProjects] = useState(initialState.content.projects);
  const [certifications, setCertifications] = useState(initialState.content.certifications);
  const [sectionVisibility, setSectionVisibility] = useState(initialState.content.sectionVisibility);
  const [sectionSubtitles, setSectionSubtitles] = useState(initialState.content.sectionSubtitles);
  const [resumeHref, setResumeHref] = useState(initialState.resumeHref);
  const [publicResumeHref, setPublicResumeHref] = useState(() =>
    normalizeHref(initialState.resumeHref),
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [contentReady, setContentReady] = useState(initialState.ready);

  const [mounts, setMounts] = useState(null);

  const navSections = useMemo(() => {
    return ALL_SECTION_IDS.filter((id) => {
      if (id === "home") return true;
      return Boolean(sectionVisibility[id]);
    });
  }, [sectionVisibility]);

  useEffect(() => {
    const headerEl = document.getElementById("site-header");
    const sectionEls = ALL_SECTION_IDS.reduce((acc, id) => {
      acc[id] = document.getElementById(id);
      return acc;
    }, {});
    setMounts({ headerEl, sectionEls });
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    const loadContent = async () => {
      try {
        const res = await fetch("/api/content", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        const raw = data && typeof data === "object" ? data.content : null;
        if (!raw || typeof raw !== "object") return;
        const normalized = normalizeStoredContent(raw);

        if (!active) return;
        setProfile(normalized.profile);
        setHeroRoles(normalized.heroRoles);
        setAboutContent(normalized.about);
        setSkillGroups(normalized.skillGroups);
        setExperience(normalized.experience);
        setEducation(normalized.education);
        setProjects(normalized.projects);
        setCertifications(normalized.certifications);
        setSectionVisibility(normalized.sectionVisibility);
        setSectionSubtitles(normalized.sectionSubtitles);
        if (typeof raw.resumeDataUrl === "string" && raw.resumeDataUrl.trim()) {
          setResumeHref(raw.resumeDataUrl.trim());
        } else {
          setResumeHref(normalized.profile.resumeUrl || "#");
        }
      } catch (error) {
        // Keep defaults when API is unavailable.
      } finally {
        window.clearTimeout(timeoutId);
        if (active) setContentReady(true);
      }
    };

    loadContent();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const nextHref = normalizeHref(resumeHref);
    if (!isPdfDataUrl(nextHref)) {
      setPublicResumeHref(nextHref);
      return;
    }

    let objectUrl = "";

    try {
      objectUrl = createPdfBlobUrl(nextHref);
      setPublicResumeHref(objectUrl);
    } catch (error) {
      setPublicResumeHref("#");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resumeHref]);

  const applyNormalizedContent = useCallback((normalized, resumeDataUrl) => {
    setProfile(normalized.profile);
    setHeroRoles(normalized.heroRoles);
    setAboutContent(normalized.about);
    setSkillGroups(normalized.skillGroups);
    setExperience(normalized.experience);
    setEducation(normalized.education);
    setProjects(normalized.projects);
    setCertifications(normalized.certifications);
    setSectionVisibility(normalized.sectionVisibility);
    setSectionSubtitles(normalized.sectionSubtitles);
    if (typeof resumeDataUrl === "string" && resumeDataUrl.trim()) {
      setResumeHref(resumeDataUrl.trim());
    } else {
      setResumeHref(normalized.profile.resumeUrl || "#");
    }
  }, []);

  const saveContentPatch = useCallback(
    async (patch) => {
      const headers = { "Content-Type": "application/json" };
      try {
        const sessionToken = globalThis.sessionStorage
          ? globalThis.sessionStorage.getItem("portfolio_admin_session") || ""
          : "";
        if (sessionToken) {
          headers["X-Admin-Session"] = sessionToken;
        }
      } catch (error) {
        // Ignore storage access errors and keep cookie-based auth path.
      }

      const res = await fetch("/api/content", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(patch),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data && typeof data.message === "string" && data.message.trim()
            ? data.message
            : "Could not save content.";
        throw new Error(message);
      }

      const raw = data && typeof data === "object" ? data.content : null;
      if (!raw || typeof raw !== "object") return;
      const normalized = normalizeStoredContent(raw);
      applyNormalizedContent(normalized, raw.resumeDataUrl);
    },
    [applyNormalizedContent],
  );

  const saveAllContent = useCallback(
    async (payload) => {
      await saveContentPatch(payload);
    },
    [saveContentPatch],
  );

  const readPdfAsDataUrl = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Could not parse PDF file."));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error("Could not read PDF file."));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleResumeFile = useCallback(
    async (file) => {
      if (!file || file.type !== "application/pdf") {
        throw new Error("Upload a PDF resume.");
      }
      const dataUrl = await readPdfAsDataUrl(file);
      await saveContentPatch({ resumeDataUrl: dataUrl });
    },
    [readPdfAsDataUrl, saveContentPatch],
  );

  const onNavigate = useCallback(
    (id) => {
      if (view !== "home") {
        if (id === "home") {
          setPendingScroll("top");
          window.location.hash = "";
        } else {
          setPendingScroll(id);
          window.location.hash = "#home";
        }
        return;
      }
      smoothScrollToId(id);
    },
    [view],
  );

  const onAdminNavigate = useCallback(() => {
    window.location.hash = "#/admin";
  }, []);

  useEffect(() => {
    const resolveView = () => {
      const hash = window.location.hash;
      if (hash === "#/projects") return "projects";
      if (hash === "#/admin") return "admin";
      return "home";
    };
    const onHash = () => setView(resolveView());
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const previous = previousViewRef.current;
    if ((previous === "projects" || previous === "admin") && view === "home" && !pendingScroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    previousViewRef.current = view;
  }, [pendingScroll, view]);

  useEffect(() => {
    if (view !== "home" || !pendingScroll) return;
    if (pendingScroll === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      smoothScrollToId(pendingScroll);
    }
    setPendingScroll("");
  }, [view, pendingScroll]);

  useEffect(() => {
    let rafId = 0;

    const compute = () => {
      rafId = 0;
      setHasShadow(window.scrollY > 8);

      if (view === "projects") {
        setActiveSection("projects");
        return;
      }
      if (view === "admin") {
        setActiveSection("home");
        return;
      }

      const headerOffset = getHeaderOffset();
      const focusY = Math.max(headerOffset + 16, window.innerHeight * 0.35);
      let current = "home";

      for (const id of navSections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= focusY && rect.bottom > focusY) {
          current = id;
          break;
        }
      }

      setActiveSection(current);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(compute);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [navSections, view]);

  useEffect(() => {
    if (!mounts) return;
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [
    mounts,
    view,
    profile,
    heroRoles,
    aboutContent,
    skillGroups,
    experience,
    education,
    projects,
    certifications,
    sectionVisibility,
  ]);

  if (!mounts || !mounts.headerEl || !contentReady) return null;

  return (
    <>
      {createPortal(
        <Header
          activeSection={activeSection}
          hasShadow={hasShadow}
          onNavigate={onNavigate}
          onAdminNavigate={onAdminNavigate}
          sections={navSections}
        />,
        mounts.headerEl,
      )}

      {view === "home"
        ? createPortal(
            <Hero
              resumeHref={publicResumeHref}
              onNavigate={onNavigate}
              profile={profile}
              roles={heroRoles}
              showProjectsButton={Boolean(sectionVisibility.projects)}
            />,
            mounts.sectionEls.home,
          )
        : null}

      {view === "admin"
        ? createPortal(
            <AdminPage
              profile={profile}
              heroRoles={heroRoles}
              aboutContent={aboutContent}
              skillGroups={skillGroups}
              experience={experience}
              education={education}
              projects={projects}
              certifications={certifications}
              sectionVisibility={sectionVisibility}
              sectionSubtitles={sectionSubtitles}
              resumeHref={resumeHref}
              isAdmin={isAdmin}
              onAdminChange={setIsAdmin}
              onSaveAllContent={saveAllContent}
              onSaveResumeFile={handleResumeFile}
              onGoHome={() => {
                window.location.hash = "#";
              }}
            />,
            mounts.sectionEls.home,
          )
        : null}

      {view === "projects" || (view === "home" && sectionVisibility.projects)
        ? createPortal(
            <Projects
              projects={projects}
              showViewAll={view === "home"}
              showBack={view === "projects"}
              title={view === "projects" ? "All Projects" : "Projects"}
              subtitle={
                view === "projects"
                  ? sectionSubtitles.projectsAll
                  : sectionSubtitles.projects
              }
            />,
            mounts.sectionEls.projects,
          )
        : null}

      {view === "home" && sectionVisibility.skills
        ? createPortal(
            <Skills skillGroups={skillGroups} subtitle={sectionSubtitles.skills} />,
            mounts.sectionEls.skills,
          )
        : null}
      {view === "home" && sectionVisibility.about
        ? createPortal(
            <About
              resumeHref={publicResumeHref}
              profile={profile}
              aboutContent={aboutContent}
              subtitle={sectionSubtitles.about}
            />,
            mounts.sectionEls.about,
          )
        : null}
      {view === "home" && sectionVisibility.experience
        ? createPortal(
            <Experience experience={experience} subtitle={sectionSubtitles.experience} />,
            mounts.sectionEls.experience,
          )
        : null}
      {view === "home" && sectionVisibility.education
        ? createPortal(
            <Education education={education} subtitle={sectionSubtitles.education} />,
            mounts.sectionEls.education,
          )
        : null}
      {view === "home" && sectionVisibility.certifications
        ? createPortal(
            <Certifications
              certifications={certifications}
              subtitle={sectionSubtitles.certifications}
            />,
            mounts.sectionEls.certifications,
          )
        : null}
      {view === "home" && sectionVisibility.contact
        ? createPortal(<ContactForm subtitle={sectionSubtitles.contact} />, mounts.sectionEls.contact)
        : null}
    </>
  );
}

