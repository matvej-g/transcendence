// Compiles to /site/public/js/user/auth/registerButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { registerHandle } from "./register.js";
import type { RegisterRequest } from "./types.js";

function wireRegisterButton() {
  const btn = document.getElementById("registerBtn") as HTMLButtonElement | null;
  if (!btn) {
    console.warn("[registerButton] #registerBtn not found");
    return;
  }

  btn.addEventListener("click", async () => {
    const u = $<HTMLInputElement>("user")?.value ?? "";
    const e = $<HTMLInputElement>("email")?.value ?? "";
    const p = $<HTMLInputElement>("pass")?.value ?? "";

    const payload: RegisterRequest = {
      userName: u.trim(),
      email: e.trim(),
      password: p,
    };

    log(
      `[UI] register → ${JSON.stringify({
        userName: payload.userName,
        email: payload.email,
        passwordMasked: payload.password ? "***" : "",
      })}`
    );

    const res = await registerHandle(payload);
    log(`[UI] register result: ${JSON.stringify(res)}`);

    alert(
      res.ok
        ? msg("registerOkPrefix") + `${res.user.username}`
        : msg("registerFailedGeneric") + ` (${res.error})`
    );
	if (res.ok) {
		window.location.hash = '#profile';
	}
  });
}

wireRegisterButton();
