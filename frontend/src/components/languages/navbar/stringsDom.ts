import type { Lang } from "../i18n.js";

// keys for landing page DOM texts
export type NavbarDomKey =
  | "profile"
  | "game"
  | "friends"
  | "chat"
  | "settings"
  | "edit_username"
  | "change_email"
  | "change_password"
  | "change_avatar"
  | "two_fa"
  | "logout";

export type NavbarDomStringsTableT = Record<NavbarDomKey, string>;

export const NavbarDomStrings: Record<Lang, NavbarDomStringsTableT> = {
  en: {
    profile: "Profile",
	game: "Game",
	friends: "Friends",
	chat: "Chat",
	settings: "Settings",
	edit_username: "Edit Username",
	change_password: "Change Password",
	change_email: "Change Email",
	change_avatar: "Change Avatar",
	two_fa: "2-Factor Auth",
	logout: "Logout"
  },
  ru: {
    profile: "Профиль",
    game: "Игра",
    friends: "Друзья",
    chat: "Чат",
    settings: "Настройки",
    edit_username: "Изменить имя пользователя",
    change_password: "Изменить пароль",
	change_email: "Изменить почту",
    change_avatar: "Изменить аватар",
    two_fa: "Двухфакторная аутентификация",
	logout: "Выйти"
  },
} as const satisfies Record<Lang, NavbarDomStringsTableT>;