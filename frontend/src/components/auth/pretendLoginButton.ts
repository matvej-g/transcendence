// Compiles to /site/public/js/user/auth/pretendLoginButton.js

import { navigateToLandingPage } from "../landing/navigation.js";

// import { $, log } from "../../utils/utils.js";
//
// function wirePretendLoginButton() {
//   const btn = $<HTMLButtonElement>("pretendLoginBtn");
//   if (!btn) { console.warn("[pretendLoginButton] #pretendLoginBtn not found"); return; }
//
//   btn.addEventListener("click", () => {
//     log("[UI] pretendLogin → navigating to /userLanding.html");
//     window.location.assign("/userLanding.html");
//   });
// }
// wirePretendLoginButton();

function wirePretendLoginButton() {
	const btn = document.getElementById('pretendLoginBtn') as HTMLButtonElement | null;
	if (!btn) {
		console.warn('[pretendLoginButton] #pretendLoginBtn not found');
		return;
	}

	btn.addEventListener('click', () => {
		console.log('[UI] pretendLogin → navigating to #profile');

		navigateToLandingPage(null);
	});
}

wirePretendLoginButton();

