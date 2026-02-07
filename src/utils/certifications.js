export const CERT_TEMPLATE = {
  title: "New Certificate",
  issuer: "",
  year: "",
  credentialUrl: "#",
};

function cleanText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function normalizeCertificate(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  return {
    title: cleanText(obj.title),
    issuer: cleanText(obj.issuer),
    year: cleanText(obj.year),
    credentialUrl: cleanText(obj.credentialUrl) || "#",
  };
}

export function normalizeCertifications(list) {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCertificate);
}

