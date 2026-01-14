import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { FriendsDomStrings } from "./stringsDom.js";

const FRIENDS_DOM_NAMESPACE = "friends" as const;

export function initFriendsDomI18n() {
  registerNamespace(FRIENDS_DOM_NAMESPACE, FriendsDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}