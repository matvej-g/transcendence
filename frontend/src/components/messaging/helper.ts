import { UserId } from "../../common/types.js";

export function getCurrentUsername(): string | null {
  const el = document.querySelector('[data-field="username"]');
  if (!el) return null;

  const text = el.textContent?.trim();
  return text && text.length > 0 ? (text as string) : null;
}