export type LoginResult =
  | { ok: true; user: { id: string; username: string }; two_factor_required?: boolean }
  | { ok: false; error: string };

import { setCurrentUserId, setUserOnline, setCurrentUsername } from './authUtils.js';

export async function loginHandle(username: string, password: string): Promise<LoginResult> {

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
    const twoFactorRequired = data?.two_factor_required ?? false;
    
    if (userIdToStore) {
      setCurrentUserId(userIdToStore);
      
      // Only initialize profile if 2FA is not required or already verified
      if (!twoFactorRequired) {
        // set user online on server
        try { await setUserOnline(); } catch (e) { console.warn('[auth] setUserOnline failed', e); }
      }
    }
	const userNameToStore = data?.user?.username ?? data?.userName ?? data?.username ?? null;
	if (userNameToStore) {
		setCurrentUsername(userNameToStore);
	}

    // Normalize return to include `user.id` and a username field
    const returnedId = String(userIdToStore ?? '');
    const returnedUsername = String(userNameToStore ?? '');
    return { ok: true, user: { id: returnedId, username: returnedUsername }, two_factor_required: twoFactorRequired };
  } catch (e) {
    console.log('[TS] loginHandle → exception', e);
    return { ok: false, error: 'NETWORK_ERROR' };
  }
}

export async function handleGoogleLogin(): Promise<void> {
  console.log('[TS] handleGoogleLogin → starting Google OAuth flow');
  
  try {
    // Get Google auth URL from backend
    const res = await fetch('/api/auth/google', {
      method: 'GET'
    });

    if (!res.ok) {
      console.error('[TS] handleGoogleLogin → failed to get auth URL', res.status);
      throw new Error('Failed to initialize Google login');
    }

    const data = await res.json();
    console.log('[TS] handleGoogleLogin → received auth URL');

    // Redirect to Google
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No auth URL received from backend');
    }
  } catch (e) {
    console.error('[TS] handleGoogleLogin → exception', e);
    alert('Failed to start Google login. Please try again.');
  }
}
