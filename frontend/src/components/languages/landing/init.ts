
import { initI18n } from "../i18n.js";
import { initLanguageButton } from "../languageButton.js";
import { initLandingDomI18n } from "./stringsDomHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  initI18n();             // set lang (html[lang], localStorage, listeners)
  initLandingDomI18n();   // register "landingDom" strings + apply to DOM
  initLanguageButton();   // mount & wire the global language switcher
});