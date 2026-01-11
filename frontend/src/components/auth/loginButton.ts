// Compiles to /site/public/js/user/auth/loginButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { loginHandle } from "./login.js";
import { apiCall } from "../../utils/api.js";
//import { navigateToLandingPage } from "../landing/navigation.js";

function wireLoginButton() {
  const btn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  if (!btn) { console.warn("[loginButton] #loginBtn not found"); return; }

  btn.addEventListener("click", async () => {
    const u = $<HTMLInputElement>("user")?.value ?? "";
    const p = $<HTMLInputElement>("pass")?.value ?? "";
    log(`[UI] login → ${JSON.stringify({ username: u, passwordMasked: p ? "***" : "" })}`);

    const res = await loginHandle(u, p);
    log(`[UI] login result: ${JSON.stringify(res)}`);
    
    if (res.ok) {
      log(`[UI] Login successful`);
      
      // Check if 2FA is required
      if (res.two_factor_required) {
        // User has 2FA enabled - send code and redirect to verification
        log(`[UI] 2FA required, sending code...`);
        
        const twoFAResult = await apiCall('/api/auth/send-2fa', {
          method: 'POST'
        });
        
        if (twoFAResult.ok && twoFAResult.data.success) {
          alert(msg("loginOkPrefix") + `${res.user.username}. 2FA code sent to your email!`);
          window.location.href = '/verify-2fa.html';
        } else {
          alert('Login successful but 2FA failed: ' + (twoFAResult.data.error || 'Unknown error'));
        }
      } else {
        // User has 2FA disabled - login complete
        alert(msg("loginOkPrefix") + `${res.user.username}`);
        window.location.href = '/index.html#profile';
      }
    } else {
      alert(msg("loginFailedGeneric") + ` (${res.error})`);
    }
  });
}
wireLoginButton();