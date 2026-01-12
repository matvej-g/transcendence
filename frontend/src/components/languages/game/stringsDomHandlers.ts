import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { GameDomStrings } from "./stringsDom.js";

const GAME_DOM_NAMESPACE = "game" as const;

export function initGameDomI18n() {
  registerNamespace(GAME_DOM_NAMESPACE, GameDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}