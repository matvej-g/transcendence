import type { Lang } from "../i18n.js";

// keys that we have in the dom that need translation
type AuthDomKey =
  | "title"
  | "username"
  | "email"
  | "password"
  | "loginBtn"
  | "registerBtn"
  | "orDivider"
  | "googleLoginBtn"
  | "verifyTitle"
  | "verifyDescription"
  | "verifyBtn"
  | "verify2faTitle"
  | "verify2faDescription"
  | "verify2faDescriptionSms"
  | "verify2faDescriptionTotp"
  | "verify2faBtn"
  | "resendCode"
    // | "pretendLoginBtn"; // Removed pretendLoginBtn

// format of the table for auth dom strings (single language)
export type AuthDomStringsTableT = Record<AuthDomKey, string>;

// define the translations here
export const authDomStrings: Record<Lang, AuthDomStringsTableT> = {
  en: {
    title: "Authentication",
    username: "Username",
    email: "Email",
    password: "Password",
    loginBtn: "Login",
    registerBtn: "Register",
    orDivider: "OR",
    googleLoginBtn: "Register/Login with Google",
    verifyTitle: "Verify Your Email",
    verifyDescription: "Enter the 6-digit code sent to your email address",
    verifyBtn: "Verify & Create Account",
    verify2faTitle: "Verify 2FA Code",
    verify2faDescription: "Enter the 6-digit code sent to your email",
    verify2faDescriptionSms: "Enter the 6-digit code sent to your phone",
    verify2faDescriptionTotp: "Enter the 6-digit code from your authenticator app",
    verify2faBtn: "Verify",
    resendCode: "Resend Code",
  },
  ru: {
    title: "Аутентификация",
    username: "Имя пользователя",
    email: "Электронная почта",
    password: "Пароль",
    loginBtn: "Войти",
    registerBtn: "Зарегистрироваться",
    orDivider: "ИЛИ",
    googleLoginBtn: "Регистрация/Вход через Google",
    verifyTitle: "Подтвердите вашу почту",
    verifyDescription: "Введите 6-значный код, отправленный на вашу почту",
    verifyBtn: "Подтвердить и создать аккаунт",
    verify2faTitle: "Подтверждение 2FA",
    verify2faDescription: "Введите 6-значный код, отправленный на вашу почту",
    verify2faDescriptionSms: "Введите 6-значный код, отправленный на ваш телефон",
    verify2faDescriptionTotp: "Введите 6-значный код из приложения-аутентификатора",
    verify2faBtn: "Подтвердить",
    resendCode: "Отправить код повторно",
  },
  de: {
	title: "Authentifizierung",
	username: "Benutzername",
	email: "EMail",
	password: "Passwort",
	loginBtn: "Anmelden",
	registerBtn: "Registrieren",
	orDivider: "ODER",
	googleLoginBtn: "Registrieren/Anmelden mit Google",
	verifyTitle: "E-Mail bestätigen",
	verifyDescription: "Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde",
	verifyBtn: "Bestätigen & Konto erstellen",
	verify2faTitle: "2FA-Code bestätigen",
	verify2faDescription: "Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde",
	verify2faDescriptionSms: "Geben Sie den 6-stelligen Code ein, der an Ihr Handy gesendet wurde",
	verify2faDescriptionTotp: "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein",
	verify2faBtn: "Bestätigen",
	resendCode: "Code erneut senden",
  },
} satisfies Record<Lang, AuthDomStringsTableT>;
