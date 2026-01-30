// Compiles to /site/public/js/user/auth/loginButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { loginHandle } from "./login.js";
import { apiCall } from "../../utils/api.js";
import { logger } from '../../utils/logger.js';
import { t } from "../languages/i18n.js";
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

            if (method === 'totp') {
              alert(msg("loginOkPrefix") + `${res.user.username}. Enter the code from your authenticator app!`);
            } else {
              const dest = method === 'sms' ? 'your phone' : 'your email';
              alert(msg("loginOkPrefix") + `${res.user.username}. 2FA code sent to ${dest}!`);
            }

            // Update verify-2fa description i18n key so language switching works
            const descEl = document.querySelector('#verify-2fa-section p[data-i18n^="authDom.verify2faDescription"]');
            if (descEl) {
              let i18nKey = 'authDom.verify2faDescription';
              if (method === 'totp') {
                i18nKey = 'authDom.verify2faDescriptionTotp';
              } else if (method === 'sms') {
                i18nKey = 'authDom.verify2faDescriptionSms';
              }
              descEl.setAttribute('data-i18n', i18nKey);
              descEl.textContent = t(i18nKey);
            }

            // Hide resend button for TOTP (codes come from the app)
            const resendBtn = document.getElementById('resend-2fa-btn');
            if (resendBtn) {
              resendBtn.style.display = method === 'totp' ? 'none' : '';
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