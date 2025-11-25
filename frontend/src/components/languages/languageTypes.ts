// frontend/src/languages/languageTypes.ts

export type Lang = "en" | "ru";

const FALLBACK_LANG: Lang = "en";

export function detectInitialLang(): Lang {
  const saved = localStorage.getItem("lang");
  if (saved === "en" || saved === "ru") {
    return saved;
  }

  const htmlLang = document.documentElement.lang.toLowerCase();
  if (htmlLang === "en" || htmlLang === "ru") {
    return htmlLang;
  }

  return FALLBACK_LANG;
}

export function setLangTag(lang: Lang) {
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);
}

export function getCurrentLang(): Lang {
  const htmlLang = document.documentElement.lang.toLowerCase();
  if (htmlLang === "en" || htmlLang === "ru") {
    return htmlLang;
  }
  return FALLBACK_LANG;
}