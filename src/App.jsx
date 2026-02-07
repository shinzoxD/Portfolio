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

export default function App() {
  const defaults = useMemo(() => getDefaultContent(), []);

  const [activeSection, setActiveSection] = useState("home");
  const [hasShadow, setHasShadow] = useState(false);
  const [view, setView] = useState("home");
  const [pendingScroll, setPendingScroll] = useState("");
  const previousViewRef = useRef("home");

  const [profile, setProfile] = useState(defaults.profile);
  const [heroRoles, setHeroRoles] = useState(defaults.heroRoles);
  const [aboutContent, setAboutContent] = useState(defaults.about);
  const [skillGroups, setSkillGroups] = useState(defaults.skillGroups);
  const [experience, setExperience] = useState(defaults.experience);
  const [education, setEducation] = useState(defaults.education);
  const [projects, setProjects] = useState(defaults.projects);
  const [certifications, setCertifications] = useState(defaults.certifications);
  const [sectionVisibility, setSectionVisibility] = useState(defaults.sectionVisibility);
  const [sectionSubtitles, setSectionSubtitles] = useState(defaults.sectionSubtitles);
  const [resumeHref, setResumeHref] = useState(defaults.profile.resumeUrl);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const loadContent = async () => {
      try {
        const res = await fetch("/api/content", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        const raw = data && typeof data === "object" ? data.content : null;
        if (!raw || typeof raw !== "object") return;
        const normalized = normalizeStoredContent(raw);

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
      }
    };

    loadContent();
  }, []);

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
      const res = await fetch("/api/content", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
  }, [mounts, view]);

  if (!mounts || !mounts.headerEl) return null;

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
              resumeHref={resumeHref}
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
              resumeHref={resumeHref}
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
