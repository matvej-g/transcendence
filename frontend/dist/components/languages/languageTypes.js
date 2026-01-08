// frontend/src/languages/languageTypes.ts
const FALLBACK_LANG = "en";
export function detectInitialLang() {
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
export function setLangTag(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
}
export function getCurrentLang() {
    const htmlLang = document.documentElement.lang.toLowerCase();
    if (htmlLang === "en" || htmlLang === "ru") {
        return htmlLang;
    }
    return FALLBACK_LANG;
}
