import type { Lang } from "../i18n.js";

// keys for profile DOM texts
export type ProfileDomKey =
  | "upload_avatar"
  | "statistics"
  | "matches"
  | "wins"
  | "losses"
  | "winning_rate"
  | "tournaments"
  | "match_history"
  | "avatar_choose_image"
  | "avatar_cancel"
  | "avatar_upload";

export type ProfileDomStringsTableT = Record<ProfileDomKey, string>;

export const ProfileDomStrings: Record<Lang, ProfileDomStringsTableT> = {
  en: {
    upload_avatar: "Upload Avatar",
    statistics: "Statistics",
    matches: "Matches",
    wins: "Wins",
    losses: "Losses",
    winning_rate: "Win Rate",
    tournaments: "Tournaments",
    match_history: "Match History",
    avatar_choose_image: "Choose image",
    avatar_cancel: "Cancel",
    avatar_upload: "Upload",
  },
  ru: {
    upload_avatar: "Загрузить аватар",
    statistics: "Статистика",
    matches: "Матчи",
    wins: "Победы",
    losses: "Поражения",
    winning_rate: "Процент побед",
    tournaments: "Турниры",
    match_history: "История матчей",
    avatar_choose_image: "Выбрать изображение",
    avatar_cancel: "Отмена",
    avatar_upload: "Загрузить",
  },
  de: {
	upload_avatar: "Avatar hochladen",
	statistics: "Statistiken",
	matches: "Spiele",
	wins: "Siege",
	losses: "Niederlagen",
	winning_rate: "Siegrate",
	tournaments: "Turniere",
	match_history: "Spielverlauf",
	avatar_choose_image: "Bild auswählen",
	avatar_cancel: "Abbrechen",
	avatar_upload: "Hochladen",
  },
} as const satisfies Record<Lang, ProfileDomStringsTableT>;