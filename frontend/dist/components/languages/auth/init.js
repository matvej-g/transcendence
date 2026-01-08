import { initI18n } from "../i18n.js";
import { initLanguageButton } from "../languageButton.js";
import { initAuthDomI18n } from "./stringsDomHandlers.js";
import { initAuthMsgI18n } from "./stringsMsgsHandlers.js";
document.addEventListener("DOMContentLoaded", () => {
    initI18n(); // sets lang (html tag + localStorage) and notifies
    initAuthDomI18n(); // DOM texts
    initAuthMsgI18n(); // TS-only messages
    initLanguageButton();
});
