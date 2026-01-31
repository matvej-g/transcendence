import type { Lang } from "../i18n.js";

export type SettingsMsgKey =
  | "totpSetupFailed"
  | "totpSetupAppFailed"
  | "totpEnterCode"
  | "totpInvalidCode"
  | "networkError"
  | "phoneRequired"
  | "phoneE164Format"
  | "phoneSaveFailed"
  | "smsSwitchFailed"
  | "methodUpdateFailed"
  | "toggleErrorPrefix"
  | "toggleFailed"
  | "oauthNo2fa";

export type SettingsMsgStringsTableT = Record<SettingsMsgKey, string>;

export const SettingsMsgStrings: Record<Lang, SettingsMsgStringsTableT> = {
  en: {
    totpSetupFailed: "Failed to set up authenticator",
    totpSetupAppFailed: "Failed to set up authenticator app",
    totpEnterCode: "Enter the 6-digit code from your app",
    totpInvalidCode: "Invalid code. Please try again.",
    networkError: "Network error",
    phoneRequired: "Phone number is required",
    phoneE164Format: "Use E.164 format (e.g. +1234567890)",
    phoneSaveFailed: "Failed to save phone number",
    smsSwitchFailed: "Failed to switch to SMS",
    methodUpdateFailed: "Failed to update 2FA method",
    toggleErrorPrefix: "Error: ",
    toggleFailed: "Failed to update 2FA settings",
    oauthNo2fa: "Two-factor authentication is not available for Google accounts. Your account is already secured by Google.",
  },
  ru: {
    totpSetupFailed: "Не удалось настроить аутентификатор",
    totpSetupAppFailed: "Не удалось настроить приложение-аутентификатор",
    totpEnterCode: "Введите 6-значный код из приложения",
    totpInvalidCode: "Неверный код. Попробуйте снова.",
    networkError: "Ошибка сети",
    phoneRequired: "Необходимо указать номер телефона",
    phoneE164Format: "Используйте формат E.164 (например, +1234567890)",
    phoneSaveFailed: "Не удалось сохранить номер телефона",
    smsSwitchFailed: "Не удалось переключиться на SMS",
    methodUpdateFailed: "Не удалось обновить метод 2FA",
    toggleErrorPrefix: "Ошибка: ",
    toggleFailed: "Не удалось обновить настройки 2FA",
    oauthNo2fa: "Двухфакторная аутентификация недоступна для аккаунтов Google. Ваш аккаунт уже защищён Google.",
  },
  de: {
    totpSetupFailed: "Authenticator konnte nicht eingerichtet werden",
    totpSetupAppFailed: "Authenticator-App konnte nicht eingerichtet werden",
    totpEnterCode: "Geben Sie den 6-stelligen Code aus Ihrer App ein",
    totpInvalidCode: "Ungültiger Code. Bitte versuchen Sie es erneut.",
    networkError: "Netzwerkfehler",
    phoneRequired: "Telefonnummer ist erforderlich",
    phoneE164Format: "Verwenden Sie das E.164-Format (z. B. +1234567890)",
    phoneSaveFailed: "Telefonnummer konnte nicht gespeichert werden",
    smsSwitchFailed: "Wechsel zu SMS fehlgeschlagen",
    methodUpdateFailed: "2FA-Methode konnte nicht aktualisiert werden",
    toggleErrorPrefix: "Fehler: ",
    toggleFailed: "2FA-Einstellungen konnten nicht aktualisiert werden",
    oauthNo2fa: "Zwei-Faktor-Authentifizierung ist für Google-Konten nicht verfügbar. Ihr Konto ist bereits durch Google geschützt.",
  },
} as const satisfies Record<Lang, SettingsMsgStringsTableT>;
