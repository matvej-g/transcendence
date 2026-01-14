import type { Lang } from "../i18n.js";

// keys for chat DOM texts
export type ChatDomKey =
  | "select_a_chat"
  | "send";

export type ChatDomStringsTableT = Record<ChatDomKey, string>;

export const ChatDomStrings: Record<Lang, ChatDomStringsTableT> = {
  en: {
    select_a_chat: "Select a chat",
    send: "Send",
  },
  ru: {
    select_a_chat: "Выберите чат",
    send: "Отправить",
  },
  de: {
	select_a_chat: "Chat auswählen",
	send: "Senden",
  },
} as const satisfies Record<Lang, ChatDomStringsTableT>;