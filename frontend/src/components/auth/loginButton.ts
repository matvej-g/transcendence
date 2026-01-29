// Compiles to /site/public/js/user/auth/loginButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { loginHandle } from "./login.js";
import { apiCall } from "../../utils/api.js";
import { logger } from '../../utils/logger.js';
//import { navigateToLandingPage } from "../landing/navigation.js";
import { appWs } from "../../ws/appWs.js";

function wireLoginButton() {
  const btn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  if (!btn) { logger.warn("[loginButton] #loginBtn not found"); return; }

  btn.addEventListener("click", async () => {
    if (btn.disabled) return;

    const u = $<HTMLInputElement>("user")?.value ?? "";
    const p = $<HTMLInputElement>("pass")?.value ?? "";
    log(`[UI] login → ${JSON.stringify({ username: u, passwordMasked: p ? "***" : "" })}`);

    btn.disabled = true;
    try {
      const res = await loginHandle(u, p);
      log(`[UI] login result: ${JSON.stringify(res)}`);

      if (res.ok) {
        log(`[UI] Login successful`);

        // Check if 2FA is required
        if (res.two_factor_required) {
          // User has 2FA enabled - send code and redirect to verification
          log(`[UI] 2FA required, sending code...`);

          const twoFAResult = await apiCall('/api/auth/send-2fa', {
            method: 'POST',
            body: JSON.stringify({})
          });

          if (twoFAResult.ok && twoFAResult.data.success) {
            const method = res.two_factor_method || 'email';
            const dest = method === 'sms' ? 'your phone' : 'your email';
            alert(msg("loginOkPrefix") + `${res.user.username}. 2FA code sent to ${dest}!`);

            // Update verify-2fa description to match the method
            const descEl = document.querySelector('#verify-2fa-section p[data-i18n="authDom.verify2faDescription"]');
            if (descEl) {
              descEl.textContent = method === 'sms'
                ? 'Enter the 6-digit code sent to your phone'
                : 'Enter the 6-digit code sent to your email';
            }

            window.location.hash = '#verify-2fa';
          } else {
            alert('Login successful but 2FA failed: ' + (twoFAResult.data.error || 'Unknown error'));
          }
        } else {
          // User has 2FA disabled - login complete
          alert(msg("loginOkPrefix") + `${res.user.username}`);
          window.location.href = '/index.html?t=' + Date.now() + '#profile';
        }
      } else {
        alert(msg("loginFailedGeneric") + ` (${res.error})`);
      }
    } finally {
      btn.disabled = false;
    }
  });
}
wireLoginButton();