import { registerNamespace, t } from "../i18n.js";
import { SettingsMsgStrings, type SettingsMsgKey } from "./stringsMsgs.js";

const SETTINGS_MSG_NAMESPACE = "settingsMsg" as const;

export function initSettingsMsgI18n() {
  registerNamespace(SETTINGS_MSG_NAMESPACE, SettingsMsgStrings);
}

export function settingsMsg(key: SettingsMsgKey): string {
  return t(`${SETTINGS_MSG_NAMESPACE}.${key}`);
}
