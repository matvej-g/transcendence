// Compiles to /site/public/js/user/auth/registerButton.js
import { $, log } from "../../utils/utils.js";
import { msg } from "../languages/auth/stringsMsgsHandlers.js";
import { registerHandle } from "./register.js";
function wireRegisterButton() {
    const btn = document.getElementById("registerBtn");
    if (!btn) {
        console.warn("[registerButton] #registerBtn not found");
        return;
    }
    btn.addEventListener("click", async () => {
        const u = $("user")?.value ?? "";
        const p = $("pass")?.value ?? "";
        log(`[UI] register → ${JSON.stringify({ username: u, passwordMasked: p ? "***" : "" })}`);
        const res = await registerHandle(u, p);
        log(`[UI] register result: ${JSON.stringify(res)}`);
        alert(res.ok ? msg(`registerOkPrefix`) + `${res.user.username}` : msg(`registerFailedGeneric`) + ` (${res.error})`);
    });
}
wireRegisterButton();
