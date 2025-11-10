export async function registerHandle(username, password) {
    console.log('[TS] registerHandle → input', { username, password });
    try {
        const res = await fetch('/api/Register.php', {
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
        console.log('[TS] registerHandle → HTTP', res.status, res.statusText);
        console.log('[TS] registerHandle → body', data);
        if (!res.ok) {
            // Normalize error shape
            const err = typeof data === 'object' && data?.error ? String(data.error) : 'Register_FAILED';
            return { ok: false, error: err };
        }
        // Expecting { ok: true, user: {...} } from PHP stub
        return { ok: true, user: data.user };
    }
    catch (e) {
        console.log('[TS] registerHandle → exception', e);
        return { ok: false, error: 'NETWORK_ERROR' };
    }
}
