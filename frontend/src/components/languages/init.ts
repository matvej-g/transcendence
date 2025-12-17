import { initI18n } from "./i18n.js";
import { initLanguageButton } from "./languageButton.js";
import { initAuthDomI18n } from "./auth/stringsDomHandlers.js";
import { initAuthMsgI18n } from "./auth/stringsMsgsHandlers.js";

import { initLandingDomI18n } from "./landing/stringsDomHandlers.js";
import { initNavbarDomI18n } from "./navbar/stringsDomHandlers.js";

document.addEventListener("DOMContentLoaded", () => {
  initI18n();          // sets lang (html tag + localStorage) and notifies

  // the translations themselves
  initAuthDomI18n();   // AUTH PAGE DOM texts
  initAuthMsgI18n();   // AUTH PAGE TS-only messages
  initLandingDomI18n(); // LANDING PAGE DOM texts
  initNavbarDomI18n();  // NAVBAR DOM texts

  // the language switcher button
  initLanguageButton();
});