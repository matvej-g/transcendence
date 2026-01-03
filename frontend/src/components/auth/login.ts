export type LoginResult =
  | { ok: true; user: { id: string; username: string } }
  | { ok: false; error: string };

import { setCurrentUserId } from './authUtils.js';
import { setUserOnline, loginUser } from './api.js';
import { initProfile } from '../profile/profile.js';

export async function loginHandle(username: string, password: string): Promise<LoginResult> {
  console.log('[TS] loginHandle → input', { username, password });

  try {
    const { res, data } = await loginUser(username, password);

    // 3) Log response
    console.log('[TS] loginMiddleware → HTTP', res.status, res.statusText);
    console.log('[TS] loginMiddleware → body', data);

    if (!res.ok) {
      // Normalize error shape
      const err = typeof data === 'object' && data?.error ? String(data.error) : 'LOGIN_FAILED';
      return { ok: false, error: err };
    }

    // store user ID in localStorage (Milena) — handle multiple possible response shapes
    const userIdToStore = data?.user?.id ?? data?.id ?? null;
    if (userIdToStore) {
      setCurrentUserId(userIdToStore);
      console.log('User data stored:', data.user ?? data);
      // set user online on server
      try { await setUserOnline(); } catch (e) { console.warn('[auth] setUserOnline failed', e); }
      // initialize profile UI immediately
      initProfile().catch((e) => console.warn('[profile] init after login failed', e));
    }

    // Normalize return to include `user.id` and a username field
    const returnedId = String(data?.user?.id ?? data?.id ?? '');
    const returnedUsername = data?.user?.username ?? data?.userName ?? data?.username ?? '';
    return { ok: true, user: { id: returnedId, username: returnedUsername } };
  } catch (e) {
    console.log('[TS] loginHandle → exception', e);
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}
