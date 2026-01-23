// stringsMsgs.ts
import type { Lang } from "../i18n.js";

export type AuthMsgKey =
  | "loginOkPrefix"
  | "loginFailedGeneric"
  | "registerOkPrefix"
  | "registerFailedGeneric"
  | "registerFailedEmail"
  | "registerFailedPassword"
  | "networkErrorGeneric"
  | "verify2faSuccess"
  | "verify2faInvalidCode"
  | "verify2faEnterCode"
  | "verifyRegNoEmail"
  | "verifyRegEnterCode"
  | "verifyRegVerifying"
  | "verifyRegSuccess"
  | "verifyRegFailed";

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
    verify2faSuccess: "Verification successful! Redirecting...",
    verify2faInvalidCode: "Invalid or expired code",
    verify2faEnterCode: "Please enter a valid 6-digit code",
    verifyRegNoEmail: "No email found. Please register again.",
    verifyRegEnterCode: "Please enter a 6-digit code",
    verifyRegVerifying: "Verifying...",
    verifyRegSuccess: "Account created successfully! Redirecting to login...",
    verifyRegFailed: "Verification failed",
  },
  ru: {
    loginOkPrefix: "Успешный вход: ",
    registerOkPrefix: "Зарегистрирован: ",

    loginFailedGeneric: "Не удалось войти. Проверьте логин и пароль.",
    registerFailedGeneric: "Не удалось зарегистрироваться. Попробуйте другое имя.",
    registerFailedEmail: "Не удалось зарегистрироваться. Email недействителен или уже используется.",
    registerFailedPassword: "Не удалось зарегистрироваться. Пароль не соответствует требованиям.",
    networkErrorGeneric: "Ошибка сети. Проверьте соединение и попробуйте снова.",
    verify2faSuccess: "Проверка успешна! Перенаправление...",
    verify2faInvalidCode: "Неверный или просроченный код",
    verify2faEnterCode: "Введите 6-значный код",
    verifyRegNoEmail: "Email не найден. Зарегистрируйтесь снова.",
    verifyRegEnterCode: "Введите 6-значный код",
    verifyRegVerifying: "Проверка...",
    verifyRegSuccess: "Аккаунт успешно создан! Перенаправление на вход...",
    verifyRegFailed: "Проверка не удалась",
  },
  de: {
	loginOkPrefix: "Anmeldung OK: ",
	registerOkPrefix: "Registriert: ",

	loginFailedGeneric: "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihren Benutzernamen und Ihr Passwort.",
	registerFailedGeneric: "Registrierung fehlgeschlagen. Bitte versuchen Sie es mit einem anderen Benutzernamen.",
	registerFailedEmail: "Registrierung fehlgeschlagen. E-Mail ist ungültig oder bereits in Verwendung.",
	registerFailedPassword: "Registrierung fehlgeschlagen. Passwort erfüllt nicht die Anforderungen.",
	networkErrorGeneric: "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
	verify2faSuccess: "Verifizierung erfolgreich! Weiterleitung...",
	verify2faInvalidCode: "Ungültiger oder abgelaufener Code",
	verify2faEnterCode: "Bitte geben Sie einen gültigen 6-stelligen Code ein",
	verifyRegNoEmail: "Keine E-Mail gefunden. Bitte registrieren Sie sich erneut.",
	verifyRegEnterCode: "Bitte geben Sie einen 6-stelligen Code ein",
	verifyRegVerifying: "Überprüfung...",
	verifyRegSuccess: "Konto erfolgreich erstellt! Weiterleitung zur Anmeldung...",
	verifyRegFailed: "Verifizierung fehlgeschlagen",
  },
} as const satisfies Record<Lang, AuthMsgStringsTableT>;