// /site/public/js/user/landing/play1vPcButton.js
import { $, log } from "../../utils/utils.js";

function wirePlay1vPcButton() {
  const btn = $("btn1vPC");
  if (!btn) { console.warn("[play1vPcButton] #btn1vPC not found"); return; }

  btn.addEventListener("click", () => {
    log("Clicked 1vPC → navigate to /play/ai");
    window.location.assign("/play/ai");
  });
}

wirePlay1vPcButton();