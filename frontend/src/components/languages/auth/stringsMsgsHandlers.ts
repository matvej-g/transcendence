// frontend/src/languages/auth/stringsMsgsHandlers.ts
import { registerNamespace, t } from "../i18n.js";
import { AuthMsgStrings, type AuthMsgKey } from "./stringsMsgs.js";

const AUTH_MSG_NAMESPACE = "authMsg" as const;

export function initAuthMsgI18n() {
  registerNamespace(AUTH_MSG_NAMESPACE, AuthMsgStrings);
}

export function msg(key: AuthMsgKey): string {
  return t(`${AUTH_MSG_NAMESPACE}.${key}`);
}