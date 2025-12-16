// Compiles to /site/public/js/user/landing/openChatsButton.js
import { $, log } from "../../utils/utils.js";
function wireOpenChatsButton() {
    const btn = $("btnOpenChats");
    if (!btn) {
        console.warn("[openChatsButton] #btnOpenChats not found");
        return;
    }
    btn.addEventListener("click", () => {
        log("Clicked Open Chats → navigating to /messages");
        window.location.assign("/messages");
    });
}
wireOpenChatsButton();
