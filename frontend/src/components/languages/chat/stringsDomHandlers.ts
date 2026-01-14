import { registerNamespace, applyI18nToDom, onLangChange } from "../i18n.js";
import { ChatDomStrings } from "./stringsDom.js";

const CHAT_DOM_NAMESPACE = "chat" as const;

export function initChatDomI18n() {
  registerNamespace(CHAT_DOM_NAMESPACE, ChatDomStrings);
  applyI18nToDom();
  onLangChange(() => applyI18nToDom());
}