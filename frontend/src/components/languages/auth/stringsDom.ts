import type { Lang } from "../i18n.js";

// keys that we have in the dom that need translation
type AuthDomKey =
  | "title"
  | "username"
  | "email"
  | "password"
  | "loginBtn"
  | "registerBtn"
  | "pretendLoginBtn";

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
    pretendLoginBtn: "pretendLogin → landing",
  },
  ru: {
    title: "Аутентификация",
    username: "Имя пользователя",
    email: "Электронная почта",
    password: "Пароль",
    loginBtn: "Войти",
    registerBtn: "Зарегистрироваться",
    pretendLoginBtn: "Сделать вид, что вошёл → landing",
  },
} satisfies Record<Lang, AuthDomStringsTableT>;