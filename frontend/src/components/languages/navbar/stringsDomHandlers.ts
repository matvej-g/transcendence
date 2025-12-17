import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { NavbarDomStrings } from "./stringsDom.js";

const NAVBAR_DOM_NAMESPACE = "navbarDom" as const;

export function initNavbarDomI18n() {
  registerNamespace(NAVBAR_DOM_NAMESPACE, NavbarDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}