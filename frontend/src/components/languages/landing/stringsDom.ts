import type { Lang } from "../i18n.js";

// keys for landing page DOM texts
export type LandingDomKey =
  | "welcomeHeading"
  | "actionsSectionLabel"
  | "mode1v1Title"
  | "mode1v1Description"
  | "modeVsPcTitle"
  | "modeVsPcDescription"
  | "tournamentTitle"
  | "tournamentDescription"
  | "profileTitle"
  | "profileDescription"
  | "messagesTitle"
  | "messagesDescription"
  | "devlogSectionTitle"
  | "devlogClearButtonLabel"
  | "devlogReadyMessage";

export type LandingDomStringsTableT = Record<LandingDomKey, string>;

export const LandingDomStrings: Record<Lang, LandingDomStringsTableT> = {
  en: {
    welcomeHeading: "Welcome",
    actionsSectionLabel: "Actions",

    mode1v1Title: "1v1",
    mode1v1Description: "Challenge another player directly.",

    modeVsPcTitle: "1vPC",
    modeVsPcDescription: "Practice against the computer.",

    tournamentTitle: "Tournament",
    tournamentDescription: "Create or join a tournament.",

    profileTitle: "My Profile",
    profileDescription: "View and edit your info.",

    messagesTitle: "My Messages",
    messagesDescription: "Read and send messages.",

    devlogSectionTitle: "Developer Log",
    devlogClearButtonLabel: "Clear",
    devlogReadyMessage: "[log] Ready.",
  },
  ru: {
    welcomeHeading: "Добро пожаловать",
    actionsSectionLabel: "Действия",

    mode1v1Title: "1 на 1",
    mode1v1Description: "Вызовите другого игрока на матч.",

    modeVsPcTitle: "1 против компьютера",
    modeVsPcDescription: "Тренируйтесь против компьютера.",

    tournamentTitle: "Турнир",
    tournamentDescription: "Создайте или присоединитесь к турниру.",

    profileTitle: "Мой профиль",
    profileDescription: "Просматривайте и изменяйте информацию о себе.",

    messagesTitle: "Мои сообщения",
    messagesDescription: "Читайте и отправляйте сообщения.",

    devlogSectionTitle: "Журнал разработчика",
    devlogClearButtonLabel: "Очистить",
    devlogReadyMessage: "[log] Готово.",
  },
} as const satisfies Record<Lang, LandingDomStringsTableT>;