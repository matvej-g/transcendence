import { RegisterRequest } from "./types.js";
import { getCurrentUserId } from "./authUtils.js";

export async function postRegisterRequest(payload: RegisterRequest): Promise<Response> {
  return await fetch("/api/user/new", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

//from here on Milena
/**
 * !!! Todo: send TOken, otherwise it wont work !!!
 * Set user status to 'online'.
 * If backend authenticates via cookies, call without `options`.
 * To send a Bearer token (JWT): `setUserOnline({ token: '...'} )`.
 */
export async function setUserOnline(options?: { token?: string }): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('no current user id');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch('/api/status/online', { method: 'PATCH', headers, body: JSON.stringify({ currentUserId: userId }) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[api] setUserOnline failed', res.status, body);
    throw new Error(`setUserOnline failed: ${res.status}`);
  }
  const re = await fetch(`/api/status/${userId}`);
  const status = await re.json();
  console.log('User online:', status.online === 1);
}

export async function setUserOffline(options?: { token?: string }): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('no current user id');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch('/api/status/offline', { method: 'PATCH', headers, body: JSON.stringify({ currentUserId: userId }) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[api] setUserOffline failed', res.status, body);
    throw new Error(`setUserOffline failed: ${res.status}`);
  }
  const re = await fetch(`/api/status/${userId}`);
  const status = await re.json();
  console.log('User online:', status.online === 1);
}
