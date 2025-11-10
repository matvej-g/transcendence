export async function loginHandle(username, password) {
    console.log('[TS] loginHandle → input', { username, password });
    try {
        const res = await fetch('/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail: username.trim(), password })
        });
        const text = await res.text();
        let data;
        try {
            data = text ? JSON.parse(text) : null;
        }
        catch {
            data = { raw: text };
        }
        // 3) Log response
        console.log('[TS] loginMiddleware → HTTP', res.status, res.statusText);
        console.log('[TS] loginMiddleware → body', data);
        if (!res.ok) {
            // Normalize error shape
            const err = typeof data === 'object' && data?.error ? String(data.error) : 'LOGIN_FAILED';
            return { ok: false, error: err };
        }
        // Expecting { ok: true, user: {...} } from PHP stub
        return { ok: true, user: data.user };
    }
    catch (e) {
        console.log('[TS] loginHandle → exception', e);
        return { ok: false, error: 'NETWORK_ERROR' };
    }
}
