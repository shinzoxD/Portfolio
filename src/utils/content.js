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
import { normalizeCertifications } from "./certifications.js";
import {
  normalizeAboutContent,
  normalizeEducation,
  normalizeExperience,
  normalizeHeroRoles,
  normalizeProfile,
  normalizeSectionSubtitles,
  normalizeSectionVisibility,
  normalizeSkillGroups,
} from "./contentShape.js";
import { normalizeProjects } from "./projects.js";

export {
  normalizeAboutContent,
  normalizeEducation,
  normalizeExperience,
  normalizeHeroRoles,
  normalizeProfile,
  normalizeSectionSubtitles,
  normalizeSectionVisibility,
  normalizeSkillGroups,
};

export function getDefaultContent() {
  const roles = normalizeHeroRoles(HERO_ROLES);
  return {
    profile: normalizeProfile(PROFILE),
    heroRoles: roles.length > 0 ? roles : ["Data Scientist", "ML Engineer", "AI Engineer"],
    about: normalizeAboutContent(ABOUT_CONTENT),
    skillGroups: normalizeSkillGroups(SKILL_GROUPS),
    experience: normalizeExperience(EXPERIENCE),
    education: normalizeEducation(EDUCATION),
    projects: normalizeProjects(PROJECTS),
    certifications: normalizeCertifications(CERTIFICATIONS),
    sectionVisibility: normalizeSectionVisibility(SECTION_VISIBILITY),
    sectionSubtitles: normalizeSectionSubtitles(SECTION_SUBTITLES),
  };
}

export function normalizeStoredContent(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const defaults = getDefaultContent();

  const roles = source.heroRoles ? normalizeHeroRoles(source.heroRoles) : defaults.heroRoles;

  return {
    profile: source.profile ? normalizeProfile(source.profile) : defaults.profile,
    heroRoles: roles.length > 0 ? roles : defaults.heroRoles,
    about: source.about ? normalizeAboutContent(source.about) : defaults.about,
    skillGroups: source.skillGroups
      ? normalizeSkillGroups(source.skillGroups)
      : defaults.skillGroups,
    experience: source.experience
      ? normalizeExperience(source.experience)
      : defaults.experience,
    education: source.education ? normalizeEducation(source.education) : defaults.education,
    projects: source.projects ? normalizeProjects(source.projects) : defaults.projects,
    certifications: source.certifications
      ? normalizeCertifications(source.certifications)
      : defaults.certifications,
    sectionVisibility: source.sectionVisibility
      ? normalizeSectionVisibility(source.sectionVisibility)
      : defaults.sectionVisibility,
    sectionSubtitles: source.sectionSubtitles
      ? normalizeSectionSubtitles(source.sectionSubtitles)
      : defaults.sectionSubtitles,
  };
}
