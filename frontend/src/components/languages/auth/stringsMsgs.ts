// stringsMsgs.ts
import type { Lang } from "../i18n.js";

export type AuthMsgKey =
  | "loginOkPrefix"
  | "loginFailedGeneric"
  | "registerOkPrefix"
  | "registerFailedGeneric"
  | "registerFailedEmail"
  | "registerFailedPassword"
  | "networkErrorGeneric";

export type AuthMsgStringsTableT = Record<AuthMsgKey, string>;

export const AuthMsgStrings: Record<Lang, AuthMsgStringsTableT> = {
  en: {
    loginOkPrefix: "Login OK: ",
    registerOkPrefix: "Registered: ",

    loginFailedGeneric: "Login failed. Please check your username and password.",
    registerFailedGeneric: "Registration failed. Please try a different username.",
    registerFailedEmail: "Registration failed. Email is invalid or already in use.",
    registerFailedPassword: "Registration failed. Password does not meet requirements.",
    networkErrorGeneric: "Network error. Please check your connection and try again.",
  },
  ru: {
    loginOkPrefix: "Успешный вход: ",
    registerOkPrefix: "Зарегистрирован: ",

    loginFailedGeneric: "Не удалось войти. Проверьте логин и пароль.",
    registerFailedGeneric: "Не удалось зарегистрироваться. Попробуйте другое имя.",
    registerFailedEmail: "Не удалось зарегистрироваться. Email недействителен или уже используется.",
    registerFailedPassword: "Не удалось зарегистрироваться. Пароль не соответствует требованиям.",
    networkErrorGeneric: "Ошибка сети. Проверьте соединение и попробуйте снова.",
  },
  de: {
	loginOkPrefix: "Anmeldung OK: ",
	registerOkPrefix: "Registriert: ",

	loginFailedGeneric: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihren Benutzernamen und Ihr Passwort.",
	registerFailedGeneric: "Registrierung fehlgeschlagen. Bitte versuchen Sie es mit einem anderen Benutzernamen.",
	registerFailedEmail: "Registrierung fehlgeschlagen. E-Mail ist ungültig oder bereits in Verwendung.",
	registerFailedPassword: "Registrierung fehlgeschlagen. Passwort erfüllt nicht die Anforderungen.",
	networkErrorGeneric: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  },
} as const satisfies Record<Lang, AuthMsgStringsTableT>;