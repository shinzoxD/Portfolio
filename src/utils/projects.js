export const PROJECT_TEMPLATE = {
  title: "New Project",
  type: "Data",
  blurb: "",
  impact: "",
  tags: [],
  links: { demo: "#", repo: "#" },
};

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function cleanTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => cleanText(tag)).filter((tag) => tag.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => cleanText(tag))
      .filter((tag) => tag.length > 0);
  }
  return [];
}

export function normalizeProject(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  const links = obj.links && typeof obj.links === "object" ? obj.links : {};
  const type = cleanText(obj.type) || "Data";

  return {
    title: cleanText(obj.title),
    type,
    blurb: cleanText(obj.blurb),
    impact: cleanText(obj.impact),
    tags: cleanTags(obj.tags),
    links: {
      demo: cleanText(links.demo) || "#",
      repo: cleanText(links.repo) || "#",
    },
  };
}

export function normalizeProjects(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProject);
}
