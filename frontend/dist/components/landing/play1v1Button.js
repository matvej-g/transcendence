// Compiles to /site/public/js/user/landing/play1v1Button.js
import { $, log } from "../../utils/utils.js";
function wirePlay1v1Button() {
    const btn = $("btn1v1");
    if (!btn) {
        console.warn("[play1v1Button] #btn1v1 not found");
        return;
    }
    btn.addEventListener("click", () => {
        log("Clicked 1v1 → navigate to /play/1v1");
        window.location.assign("/play/1v1");
    });
}
wirePlay1v1Button();
