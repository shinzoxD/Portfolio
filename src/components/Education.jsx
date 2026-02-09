import React, { useEffect, useState } from "react";
import Card from "./Card.jsx";
import { EDUCATION } from "../data/siteConfig.js";

const JKLU_FALLBACK_IMAGE_URL =
  "https://assets.kollegeapply.com/images/1751565627972-1604396742phpXud8FD.jpeg";

const JKLU_LEGACY_IMAGE_URLS = new Set([
  "https://assets.kollegeapply.com/images/1751565622989-1737521636phpMEVziF.jpeg",
  "https://upload.wikimedia.org/wikipedia/commons/e/ef/JK_Lakshmipat_University.jpg",
]);

function getFallbackImageUrl(item) {
  const school = item && typeof item.school === "string" ? item.school : "";
  if (school.toLowerCase().includes("jk lakshmipat university")) {
    return JKLU_FALLBACK_IMAGE_URL;
  }
  return "";
}

function getInitialImageUrl(item) {
  const imageUrl = item && typeof item.imageUrl === "string" ? item.imageUrl.trim() : "";
  const fallbackImageUrl = getFallbackImageUrl(item);
  if (!fallbackImageUrl) return imageUrl;
  if (!imageUrl || JKLU_LEGACY_IMAGE_URLS.has(imageUrl)) return fallbackImageUrl;
  return imageUrl;
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 2v3M16 2v3M4.5 9.5h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v12A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5v-12A2.5 2.5 0 0 1 6.5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPin(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EducationCard({ item }) {
  const [currentImageUrl, setCurrentImageUrl] = useState(getInitialImageUrl(item));

  useEffect(() => {
    setCurrentImageUrl(getInitialImageUrl(item));
  }, [item.imageUrl]);

  const badge = item.typeLabel || "Education";
  const details =
    item.details && item.details.trim().length > 0 ? item.details : " ";
  const altText = item.imageAlt || "Education image";
  const fallbackImageUrl = getFallbackImageUrl(item);

  const onImageError = () => {
    if (fallbackImageUrl && currentImageUrl !== fallbackImageUrl) {
      setCurrentImageUrl(fallbackImageUrl);
      return;
    }
    setCurrentImageUrl("");
  };

  return (
    <Card className="h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="relative h-52 w-full sm:h-60">
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={altText}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={onImageError}
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-br from-zinc-900 to-black"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
          />
        </div>

        <div className="flex h-full flex-col p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/10">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-gradient-to-r from-slate-200 via-zinc-200 to-gray-400"
              />
              {badge}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-bold leading-snug text-white/95">
            {item.school}
          </h3>
          <p className="mt-2 text-sm font-semibold text-slate-200/90">
            {item.degree}
          </p>

          <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <IconCalendar className="h-4 w-4 text-white/50" />
            <span className="font-medium">{item.period}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/70">{details}</p>

          {item.location ? (
            <>
              <div className="mt-5 h-px w-full bg-white/10" />
              <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                <IconPin className="h-4 w-4 text-white/50" />
                <span className="font-medium">{item.location}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default function Education({ education, subtitle = "My academic journey" }) {
  const items = Array.isArray(education) ? education : EDUCATION;
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="reveal text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Education
        </h2>
        <p className="mt-2 text-sm text-white/75 sm:text-base">{subtitle}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {items.map((item) => (
          <EducationCard key={`${item.school}-${item.degree}`} item={item} />
        ))}
      </div>
    </div>
  );
}
