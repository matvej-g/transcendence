import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { ProfileDomStrings } from "./stringsDom.js";

const PROFILE_DOM_NAMESPACE = "profile" as const;

export function initProfileDomI18n() {
  registerNamespace(PROFILE_DOM_NAMESPACE, ProfileDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}