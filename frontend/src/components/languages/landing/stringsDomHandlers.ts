import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { LandingDomStrings } from "./stringsDom.js";

const LANDING_DOM_NAMESPACE = "landingDom" as const;

export function initLandingDomI18n() {
  registerNamespace(LANDING_DOM_NAMESPACE, LandingDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}