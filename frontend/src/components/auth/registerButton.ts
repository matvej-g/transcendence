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

    if (res.ok) {
      // Registration initiated - redirect to verification page
      alert('Verification code sent to your email!');
      window.location.hash = `#verify-registration?email=${encodeURIComponent(payload.email)}`;
    } else {
      alert(msg("registerFailedGeneric") + ` (${res.error})`);
    }
  });
}

wireRegisterButton();
