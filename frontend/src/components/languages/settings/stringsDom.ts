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
  | "change"
  | "googleCannotChangePassword"
  | "googlePasswordManaged"
  | "googleCannotChangeEmail"
  | "googleEmailManaged"
  | "backToProfile"
  | "placeholder_new_username"
  | "placeholder_new_email"
  | "placeholder_old_password"
  | "placeholder_new_password";

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
    googleCannotChangePassword: "Cannot change password for Google accounts.",
    googlePasswordManaged: "Your password is managed by Google.",
    googleCannotChangeEmail: "Cannot change email for Google accounts.",
    googleEmailManaged: "Your email is managed by Google.",
    backToProfile: "Back to Profile",
    placeholder_new_username: "Enter new username",
    placeholder_new_email: "Enter new email",
    placeholder_old_password: "Enter old password",
    placeholder_new_password: "Enter new password",
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
    googleCannotChangePassword: "Невозможно изменить пароль для аккаунтов Google.",
    googlePasswordManaged: "Ваш пароль управляется Google.",
    googleCannotChangeEmail: "Невозможно изменить почту для аккаунтов Google.",
    googleEmailManaged: "Ваша почта управляется Google.",
    backToProfile: "Назад в профиль",
    placeholder_new_username: "Введите новое имя",
    placeholder_new_email: "Введите новую почту",
    placeholder_old_password: "Введите старый пароль",
    placeholder_new_password: "Введите новый пароль",
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
	googleCannotChangePassword: "Passwort kann für Google-Konten nicht geändert werden.",
	googlePasswordManaged: "Ihr Passwort wird von Google verwaltet.",
	googleCannotChangeEmail: "E-Mail kann für Google-Konten nicht geändert werden.",
	googleEmailManaged: "Ihre E-Mail wird von Google verwaltet.",
	backToProfile: "Zurück zum Profil",
	placeholder_new_username: "Neuen Benutzernamen eingeben",
	placeholder_new_email: "Neue E-Mail eingeben",
	placeholder_old_password: "Altes Passwort eingeben",
	placeholder_new_password: "Neues Passwort eingeben",
  },
} as const satisfies Record<Lang, SettingsDomStringsTableT>;