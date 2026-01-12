import type { Lang } from "../i18n.js";

// keys for friends DOM texts
export type FriendsDomKey =
  | "search"
  | "send_friend_request"
  | "your_friends"
  | "friend_requests";

export type FriendsDomStringsTableT = Record<FriendsDomKey, string>;

export const FriendsDomStrings: Record<Lang, FriendsDomStringsTableT> = {
  en: {
    search: "Search",
    send_friend_request: "Send friend request",
    your_friends: "Your friends",
    friend_requests: "Friend requests",
  },
  ru: {
    search: "Поиск",
    send_friend_request: "Отправить заявку в друзья",
    your_friends: "Ваши друзья",
    friend_requests: "Заявки в друзья",
  },
} as const satisfies Record<Lang, FriendsDomStringsTableT>;