/**
 * Auth-related small helpers.
 * note: also used in src/components/messaging/chatPage.ts
 */
export function getCurrentUserId(): string | null {
  const id = localStorage.getItem('userId');
  if (!id) return null;
  const trimmed = id.trim();
  return trimmed === '' ? null : trimmed;
}

export function getCurrentUserIdNumber(): number | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const n = Number(id);
  if (!Number.isFinite(n) || Number.isNaN(n)) return null;
  return Math.floor(n);
}

export function setCurrentUserId(id: string | number): void {
  localStorage.setItem('userId', String(id));
}

export function clearCurrentUserId(): void {
  localStorage.removeItem('userId');
}

export function setCurrentUsername(username: string): void {
  localStorage.setItem('username', username);
}

export function clearCurrentUsername(): void {
  localStorage.removeItem('username');
}

export function getCurrentUsername(): string | null {
  const username = localStorage.getItem('username');
  if (!username) return null;
  const trimmed = username.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Set user status to 'online'.
 */
export async function setUserOnline(options?: { token?: string }): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('no current user id');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch('/api/status/online', { method: 'PATCH', headers, body: JSON.stringify({ currentUserId: userId }), credentials: 'include' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[authUtils] setUserOnline failed', res.status, body);
    throw new Error(`setUserOnline failed: ${res.status}`);
  }
}

/**
 * Set user status to 'offline'.
 */
export async function setUserOffline(options?: { token?: string }): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('no current user id');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch('/api/status/offline', { method: 'PATCH', headers, body: JSON.stringify({ currentUserId: userId }), credentials: 'include' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[authUtils] setUserOffline failed', res.status, body);
    throw new Error(`setUserOffline failed: ${res.status}`);
  }
}
