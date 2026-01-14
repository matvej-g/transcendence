import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { SettingsDomStrings } from "./stringsDom.js";

const SETTINGS_DOM_NAMESPACE = "settings" as const;

export function initSettingsDomI18n() {
  registerNamespace(SETTINGS_DOM_NAMESPACE, SettingsDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}