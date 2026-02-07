function cleanText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function cleanList(input) {
  if (Array.isArray(input)) {
    return input.map((item) => cleanText(item)).filter((item) => item.length > 0);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => cleanText(item))
      .filter((item) => item.length > 0);
  }
  return [];
}

export function normalizeProfile(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    name: cleanText(source.name),
    role: cleanText(source.role),
    tagline: cleanText(source.tagline),
    location: cleanText(source.location),
    email: cleanText(source.email),
    github: cleanText(source.github) || "#",
    linkedin: cleanText(source.linkedin) || "#",
    resumeUrl: cleanText(source.resumeUrl) || "#",
  };
}

export function normalizeHeroRoles(raw) {
  return cleanList(raw);
}

export function normalizeAboutContent(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const cards = Array.isArray(source.cards) ? source.cards : [];

  return {
    paragraph: cleanText(source.paragraph),
    cards: cards
      .map((card) => {
        const item = card && typeof card === "object" ? card : {};
        return {
          title: cleanText(item.title),
          body: cleanText(item.body),
        };
      })
      .filter((card) => card.title.length > 0 || card.body.length > 0),
  };
}

export function normalizeSkillGroups(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((group) => {
      const item = group && typeof group === "object" ? group : {};
      return {
        title: cleanText(item.title),
        blurb: cleanText(item.blurb),
        items: cleanList(item.items),
      };
    })
    .filter((group) => group.title.length > 0 || group.items.length > 0);
}

export function normalizeExperience(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const item = entry && typeof entry === "object" ? entry : {};
      return {
        company: cleanText(item.company),
        role: cleanText(item.role),
        period: cleanText(item.period),
        location: cleanText(item.location),
        bullets: cleanList(item.bullets),
      };
    })
    .filter((entry) => entry.company.length > 0 || entry.role.length > 0);
}

export function normalizeEducation(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const item = entry && typeof entry === "object" ? entry : {};
      return {
        school: cleanText(item.school),
        degree: cleanText(item.degree),
        period: cleanText(item.period),
        details: cleanText(item.details),
        typeLabel: cleanText(item.typeLabel),
        location: cleanText(item.location),
        imageUrl: cleanText(item.imageUrl),
        imageAlt: cleanText(item.imageAlt),
      };
    })
    .filter((entry) => entry.school.length > 0 || entry.degree.length > 0);
}

export function normalizeSectionVisibility(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    projects: Object.prototype.hasOwnProperty.call(source, "projects")
      ? Boolean(source.projects)
      : true,
    skills: Object.prototype.hasOwnProperty.call(source, "skills")
      ? Boolean(source.skills)
      : true,
    about: Object.prototype.hasOwnProperty.call(source, "about")
      ? Boolean(source.about)
      : true,
    experience: Object.prototype.hasOwnProperty.call(source, "experience")
      ? Boolean(source.experience)
      : true,
    education: Object.prototype.hasOwnProperty.call(source, "education")
      ? Boolean(source.education)
      : true,
    certifications: Object.prototype.hasOwnProperty.call(source, "certifications")
      ? Boolean(source.certifications)
      : true,
    contact: Object.prototype.hasOwnProperty.call(source, "contact")
      ? Boolean(source.contact)
      : true,
  };
}

export function normalizeSectionSubtitles(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    projects:
      Object.prototype.hasOwnProperty.call(source, "projects") && typeof source.projects === "string"
        ? source.projects.trim()
        : "",
    projectsAll:
      Object.prototype.hasOwnProperty.call(source, "projectsAll") && typeof source.projectsAll === "string"
        ? source.projectsAll.trim()
        : "",
    skills:
      Object.prototype.hasOwnProperty.call(source, "skills") && typeof source.skills === "string"
        ? source.skills.trim()
        : "",
    about:
      Object.prototype.hasOwnProperty.call(source, "about") && typeof source.about === "string"
        ? source.about.trim()
        : "",
    experience:
      Object.prototype.hasOwnProperty.call(source, "experience") && typeof source.experience === "string"
        ? source.experience.trim()
        : "",
    education:
      Object.prototype.hasOwnProperty.call(source, "education") && typeof source.education === "string"
        ? source.education.trim()
        : "",
    certifications:
      Object.prototype.hasOwnProperty.call(source, "certifications") && typeof source.certifications === "string"
        ? source.certifications.trim()
        : "",
    contact:
      Object.prototype.hasOwnProperty.call(source, "contact") && typeof source.contact === "string"
        ? source.contact.trim()
        : "",
  };
}
