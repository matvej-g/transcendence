// Compiles to /site/public/js/user/auth/registerButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { registerHandle } from './register.js';
import { logger } from '../../utils/logger.js';
import type { RegisterRequest } from "./types.js";

function wireRegisterButton() {
  const btn = document.getElementById("registerBtn") as HTMLButtonElement | null;
  if (!btn) {
    logger.warn("[registerButton] #registerBtn not found");
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
      // Map specific error messages
      let errorMsg = msg("registerFailedGeneric");
      
      if (res.error.toLowerCase().includes("email")) {
        errorMsg = msg("registerFailedEmail");
      } else if (res.error.toLowerCase().includes("password")) {
        errorMsg = msg("registerFailedPassword");
      } else if (res.error.toLowerCase().includes("username")) {
        errorMsg = msg("registerFailedGeneric");
      }
      
      alert(errorMsg + ` (${res.error})`);
    }
  });
}

wireRegisterButton();
