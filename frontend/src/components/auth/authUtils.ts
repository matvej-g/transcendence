/**
 * Auth-related small helpers.
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
  console.log('User data stored in localStorage: id = ', id);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem('userId');
  console.log('User data removed from localStorage.');
}

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
    console.warn('[authUtils] setUserOnline failed', res.status, body);
    throw new Error(`setUserOnline failed: ${res.status}`);
  }
 	const re = await fetch(`/api/status/${userId}`);
	const status = await re.json();
	console.log('User online:', status.online === 1);
}

/**
 * * !!! Todo: send Token, otherwise it wont work !!!
 * Set user status to 'offline'.
 */
export async function setUserOffline(options?: { token?: string }): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('no current user id');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch('/api/status/offline', { method: 'PATCH', headers, body: JSON.stringify({ currentUserId: userId }) });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn('[authUtils] setUserOffline failed', res.status, body);
    throw new Error(`setUserOffline failed: ${res.status}`);
  }
//   console.log("Set user offline.");
  const re = await fetch(`/api/status/${userId}`);
	const status = await re.json();
	console.log('User online:', status.online === 1);
}
