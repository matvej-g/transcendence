export type LoginResult =
  | { ok: true; user: { id: string; username: string }; two_factor_required?: boolean }
  | { ok: false; error: string };

import { setCurrentUserId, setUserOnline, setCurrentUsername } from './authUtils.js';
import { initProfile } from '../profile/profile.js';

export async function loginHandle(username: string, password: string): Promise<LoginResult> {
  console.log('[TS] loginHandle → input', { username, password }); // todo delete password log

  try {
    const res = await fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail: username.trim(), password })
    });

    const text = await res.text();
    let data: any;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

    // 3) Log response
    console.log('[TS] loginMiddleware → HTTP', res.status, res.statusText);
    console.log('[TS] loginMiddleware → body', data);

    if (!res.ok) {
      // Normalize error shape
      const err = typeof data === 'object' && data?.error ? String(data.error) : 'LOGIN_FAILED';
      return { ok: false, error: err };
    }

    // store user ID in localStorage (Milena) — handle multiple possible response shapes
	// todo why do we have userIdToStore AND returnedId?
    const userIdToStore = data?.user?.id ?? data?.id ?? null;
    if (userIdToStore) {
      setCurrentUserId(userIdToStore);
      console.log('User data stored:', data.user ?? data);
      // set user online on server
      try { await setUserOnline(); } catch (e) { console.warn('[auth] setUserOnline failed', e); }
      // initialize profile UI immediately
      initProfile().catch((e) => console.warn('[profile] init after login failed', e));
    }
	const userNameToStore = data?.user?.username ?? data?.userName ?? data?.username ?? null;
	if (userNameToStore) {
		setCurrentUsername(userNameToStore);
	}

    // Normalize return to include `user.id` and a username field
    const returnedId = String(userIdToStore ?? '');
    const returnedUsername = String(userNameToStore ?? '');
    const twoFactorRequired = data?.two_factor_required ?? false;
    return { ok: true, user: { id: returnedId, username: returnedUsername }, two_factor_required: twoFactorRequired };
  } catch (e) {
    console.log('[TS] loginHandle → exception', e);
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}
