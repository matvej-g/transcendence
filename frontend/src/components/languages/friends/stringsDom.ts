import type { Lang } from "../i18n.js";

// keys for friends DOM texts
export type FriendsDomKey =
  | "search"
  | "input_box"
  | "no_user_id_found"
  | "no_friends_yet"
  | "no_friend_requests"
  | "failed_to_load"
  | "failed_to_load_requests"
  | "send_friend_request"
  | "your_friends"
  | "friend_requests"
  | "online"
  | "offline"
  | "unknown"
  | "block_user"
  | "accept"
  | "decline";

export type FriendsDomStringsTableT = Record<FriendsDomKey, string>;

export const FriendsDomStrings: Record<Lang, FriendsDomStringsTableT> = {
  en: {
    search: "Search",
	input_box: "Search nickname...",
    send_friend_request: "Send friend request",
    your_friends: "Your friends",
    friend_requests: "Friend requests",
	no_user_id_found: "No user ID found",
	no_friends_yet: "No friends yet.",
	no_friend_requests: "No friend requests.",
	failed_to_load: "Failed to load friends",
	failed_to_load_requests: "Failed to load requests",
	online: "Online",
	offline: "Offline",
	unknown: "Unknown",
	block_user: "Block user",
	accept: "Accept",
	decline: "Decline"
  },
  ru: {
    search: "Поиск",
	input_box: "Поиск по нику...",
    send_friend_request: "Отправить заявку в друзья",
    your_friends: "Ваши друзья",
    friend_requests: "Заявки в друзья",
	no_user_id_found: "Идентификатор пользователя не найден",
	no_friends_yet: "Пока нет друзей.",
	no_friend_requests: "Нет заявок в друзья.",
	failed_to_load: "Не удалось загрузить друзей",
	failed_to_load_requests: "Не удалось загрузить заявки",
	online: "В сети",
	offline: "Не в сети",
	unknown: "Неизвестно",
	block_user: "Заблокировать пользователя",
	accept: "Принять",
	decline: "Отклонить"
  },
  de: {
	search: "Suchen",
	input_box: "Nach Spitznamen suchen...",
	send_friend_request: "Freundschaftsanfrage senden",
	your_friends: "Deine Freunde",
	friend_requests: "Freundschaftsanfragen",
	no_user_id_found: "Keine Benutzer-ID gefunden",
	no_friends_yet: "Noch keine Freunde.",
	no_friend_requests: "Keine Freundschaftsanfragen.",
	failed_to_load: "Freunde konnten nicht geladen werden",
	failed_to_load_requests: "Anfragen konnten nicht geladen werden",
	online: "Online",
	offline: "Offline",
	unknown: "Unbekannt",
	block_user: "Benutzer blockieren",
	accept: "Akzeptieren",
	decline: "Ablehnen"
  },
} as const satisfies Record<Lang, FriendsDomStringsTableT>;