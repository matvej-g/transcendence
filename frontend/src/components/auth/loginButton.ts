// Compiles to /site/public/js/user/auth/loginButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { loginHandle } from "./login.js";
import { navigateToLandingPage } from "../landing/navigation.js";

function wireLoginButton() {
  const btn = document.getElementById("loginBtn") as HTMLButtonElement | null;
  if (!btn) { console.warn("[loginButton] #loginBtn not found"); return; }

  btn.addEventListener("click", async () => {
    const u = $<HTMLInputElement>("user")?.value ?? "";
    const p = $<HTMLInputElement>("pass")?.value ?? "";
    log(`[UI] login → ${JSON.stringify({ username: u, passwordMasked: p ? "***" : "" })}`);

    const res = await loginHandle(u, p);
    log(`[UI] login result: ${JSON.stringify(res)}`);
    alert(res.ok ? msg("loginOkPrefix") + `${res.user.username}` : msg("loginFailedGeneric") + ` (${res.error})`);
	if (res.ok) {
		navigateToLandingPage(res.user);
	}

  });
}
wireLoginButton();
