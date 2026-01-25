import type { Lang } from "../i18n.js";

// keys for chat DOM texts
export type ChatDomKey =
  | "select_a_chat"
  | "send"
  | "no_conversations_yet"
  | "conversation"
  | "open_conversation"
  | "start_conversation"
  | "type_a_message"
  | "search_chats"
  | "invite_to_play"
  | "view_profile"

export type ChatDomStringsTableT = Record<ChatDomKey, string>;

export const ChatDomStrings: Record<Lang, ChatDomStringsTableT> = {
  en: {
    select_a_chat: "Select a chat",
    send: "Send",
	no_conversations_yet: "No conversations yet",
	conversation: "Conversation",
	open_conversation: "Open conversation",
	start_conversation: "Start conversation",
	type_a_message: "Type a message...",
	search_chats: "Search chats...",
	invite_to_play: "Invite to play",
	view_profile: "View profile"
  },
  ru: {
    select_a_chat: "Выберите чат",
    send: "Отправить",
	no_conversations_yet: "Пока нет бесед",
	conversation: "Беседа",
	open_conversation: "Открыть беседу",
	start_conversation: "Начать беседу",
	type_a_message: "Введите сообщение...",
	search_chats: "Поиск по чатам...",
	invite_to_play: "Пригласить играть",
	view_profile: "Просмотр профиля"
  },
  de: {
	select_a_chat: "Chat auswählen",
	send: "Senden",
	no_conversations_yet: "Noch keine Gespräche",
	conversation: "Gespräch",
	open_conversation: "Gespräch öffnen",
	start_conversation: "Gespräch starten",
	type_a_message: "Nachricht eingeben...",
	search_chats: "Chats suchen...",
	invite_to_play: "Zum Spielen einladen",
	view_profile: "Profil anzeigen"
  },
} as const satisfies Record<Lang, ChatDomStringsTableT>;