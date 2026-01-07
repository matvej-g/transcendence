// Compiles to /site/public/js/user/auth/loginButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { loginHandle } from "./login.js";
import { apiCall } from "../../utils/api.js";
function wireLoginButton() {
    const btn = document.getElementById("loginBtn");
    if (!btn) {
        console.warn("[loginButton] #loginBtn not found");
        return;
    }
    btn.addEventListener("click", async () => {
        const u = $("user")?.value ?? "";
        const p = $("pass")?.value ?? "";
        log(`[UI] login → ${JSON.stringify({ username: u, passwordMasked: p ? "***" : "" })}`);
        const res = await loginHandle(u, p);
        log(`[UI] login result: ${JSON.stringify(res)}`);
        if (res.ok) {
            // Login successful - now trigger 2FA
            log(`[UI] Login successful, sending 2FA code...`);
            const twoFAResult = await apiCall('/api/auth/send-2fa', {
                method: 'POST'
            });
            if (twoFAResult.ok && twoFAResult.data.success) {
                alert(msg("loginOkPrefix") + `${res.user.username}. 2FA code sent to your email!`);
                // Redirect to 2FA verification page
                window.location.href = '/verify-2fa.html';
            }
            else {
                alert('Login successful but 2FA failed: ' + (twoFAResult.data.error || 'Unknown error'));
            }
        }
        else {
            alert(msg("loginFailedGeneric") + ` (${res.error})`);
        }
    });
}
wireLoginButton();
