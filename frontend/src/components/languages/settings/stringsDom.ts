import type { Lang } from "../i18n.js";

// keys for settings DOM texts
export type SettingsDomKey =
  | "edit_username"
  | "new_username"
  | "cancel"
  | "save"
  | "change_email"
  | "new_email"
  | "change_password"
  | "old_password"
  | "new_password"
  | "change";

export type SettingsDomStringsTableT = Record<SettingsDomKey, string>;

export const SettingsDomStrings: Record<Lang, SettingsDomStringsTableT> = {
  en: {
    edit_username: "Edit Username",
    new_username: "New username",
    cancel: "Cancel",
    save: "Save",
    change_email: "Change Email",
    new_email: "New email",
    change_password: "Change Password",
    old_password: "Old password",
    new_password: "New password",
    change: "Change",
  },
  ru: {
    edit_username: "Изменить имя пользователя",
    new_username: "Новое имя пользователя",
    cancel: "Отмена",
    save: "Сохранить",
    change_email: "Изменить почту",
    new_email: "Новая почта",
    change_password: "Изменить пароль",
    old_password: "Старый пароль",
    new_password: "Новый пароль",
    change: "Изменить",
  },
  de: {
	edit_username: "Benutzernamen bearbeiten",
	new_username: "Neuer Benutzername",
	cancel: "Abbrechen",
	save: "Speichern",
	change_email: "E-Mail ändern",
	new_email: "Neue E-Mail",
	change_password: "Passwort ändern",
	old_password: "Altes Passwort",
	new_password: "Neues Passwort",
	change: "Ändern",
  },
} as const satisfies Record<Lang, SettingsDomStringsTableT>;