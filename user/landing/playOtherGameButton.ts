// Compiles to /site/public/js/user/landing/playOtherGameButton.js
import { $, log } from "../../utils/utils.js";

function wirePlayOtherGameButton() {
  const btn = $<HTMLButtonElement>("btnOtherGame");
  if (!btn) {
    console.warn("[playOtherGameButton] #btnOtherGame not found");
    return;
  }

  btn.addEventListener("click", () => {
    log("Clicked Other Game → /otherGame/extractDots.html");
    window.location.assign("/otherGame/extractDots.html");
  });
}

wirePlayOtherGameButton();