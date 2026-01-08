// frontend/src/languages/i18n.ts
const registry = {
    en: {},
    ru: {},
};
let currentLang = "en";
const FALLBACK_LANG = "en";
// -------- detect + init --------
function detectInitialLang() {
    // 1) localStorage if available/implemented
    try {
        const saved = window.localStorage?.getItem("lang");
        if (saved === "en" || saved === "ru") {
            return saved;
        }
    }
    catch {
        // ignore storage issues
    }
    // 2) <html lang="...">
    const htmlLang = document.documentElement.lang.toLowerCase();
    if (htmlLang === "en" || htmlLang === "ru") {
        return htmlLang;
    }
    // 3) fallback
    return FALLBACK_LANG;
}
export function initI18n() {
    const lang = detectInitialLang();
    setLang(lang); // will set tag + notify listeners
}
// -------- registration --------
/**
 * Register a namespace like "auth", "profile", etc.
 * keys: auth.title, auth.loginBtn, ...
 */
export function registerNamespace(namespace, translations) {
    Object.keys(translations).forEach((lang) => {
        const src = translations[lang];
        const dst = registry[lang];
        Object.keys(src).forEach((key) => {
            const flatKey = `${namespace}.${key}`;
            dst[flatKey] = src[key];
        });
    });
}
// -------- lookup --------
export function getLang() {
    return currentLang;
}
export function t(flatKey) {
    const table = registry[currentLang] || registry[FALLBACK_LANG];
    const fallbackTable = registry[FALLBACK_LANG];
    return table[flatKey] ?? fallbackTable[flatKey] ?? flatKey;
}
const listeners = new Set();
export function onLangChange(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}
export function setLang(lang) {
    if (currentLang === lang)
        return;
    currentLang = lang;
    document.documentElement.lang = lang;
    // keep for later page loads
    try {
        window.localStorage?.setItem("lang", lang);
    }
    catch {
        // ignore if not implemented/available
    }
    listeners.forEach((cb) => cb(lang));
}
// -------- DOM helper (HTML texts) --------
/**
 * Apply translations to elements with data-i18n="namespace.key"
 */
export function applyI18nToDom() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (!key)
            return;
        el.textContent = t(key);
    });
}
