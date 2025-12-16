// frontend/src/languages/auth/stringsDomHandlers.ts
import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { authDomStrings } from "./stringsDom.js";
// namespace name used in data-i18n="authDom.title"
export const AUTH_DOM_NAMESPACE = "authDom";
/**
 * Initialize DOM translations for the auth page.
 * - registers all auth DOM strings under the "authDom" namespace
 * - applies them to the DOM
 * - re-applies them whenever the language changes
 */
export function initAuthDomI18n() {
    // register all languages + keys in one go, no duplication
    registerNamespace(AUTH_DOM_NAMESPACE, authDomStrings);
    // initial apply: fills all [data-i18n="authDom.*"]
    applyI18nToDom();
    // whenever language switches, re-apply DOM translations
    onLangChange(() => applyI18nToDom());
}
