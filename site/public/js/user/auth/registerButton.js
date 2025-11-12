// Compiles to /site/public/js/user/auth/registerButton.js
import { registerHandle } from "./register.js";
const $ = (id) => document.getElementById(id);
const logEl = () => document.getElementById("log");
function log(...a) {
    console.log(...a);
    const el = logEl();
    if (el)
        el.textContent += a.map(x => (typeof x === "string" ? x : JSON.stringify(x))).join(" ") + "\n";
}
function wireRegisterButton() {
    const btn = document.getElementById("registerBtn");
    if (!btn) {
        console.warn("[registerButton] #registerBtn not found");
        return;
    }
    btn.addEventListener("click", async () => {
        const u = $("user")?.value ?? "";
        const p = $("pass")?.value ?? "";
        log("[UI] register →", { username: u, passwordMasked: p ? "***" : "" });
        const res = await registerHandle(u, p);
        log("[UI] register result:", res);
        alert(res.ok ? `Registered: ${res.user.username}` : `Register failed: ${res.error}`);
    });
}
wireRegisterButton();
