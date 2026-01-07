// Compiles to /site/public/js/user/auth/pretendLoginButton.js
import { $, log } from "../../utils/utils.js";
function wirePretendLoginButton() {
    const btn = $("pretendLoginBtn");
    if (!btn) {
        console.warn("[pretendLoginButton] #pretendLoginBtn not found");
        return;
    }
    btn.addEventListener("click", () => {
        log("[UI] pretendLogin → navigating to /userLanding.html");
        window.location.assign("/userLanding.html");
    });
}
wirePretendLoginButton();
