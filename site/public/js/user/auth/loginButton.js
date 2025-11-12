// Compiles to /site/public/js/user/auth/loginButton.js
import { loginHandle } from "./login.js";
const $ = (id) => document.getElementById(id);
const logEl = () => document.getElementById("log");
function log(...a) {
    console.log(...a);
    const el = logEl();
    if (el)
        el.textContent += a.map(x => (typeof x === "string" ? x : JSON.stringify(x))).join(" ") + "\n";
}
// Auto-wire when the module loads (after DOM is parsed if script is at the end)
function wireLoginButton() {
    const btn = document.getElementById("loginBtn");
    if (!btn) {
        console.warn("[loginButton] #loginBtn not found");
        return;
    }
    btn.addEventListener("click", async () => {
        const u = $("user")?.value ?? "";
        const p = $("pass")?.value ?? "";
        log("[UI] login →", { username: u, passwordMasked: p ? "***" : "" });
        const res = await loginHandle(u, p);
        log("[UI] login result:", res);
        alert(res.ok ? `Login OK: ${res.user.username}` : `Login failed: ${res.error}`);
    });
}
wireLoginButton();
