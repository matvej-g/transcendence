// Compiles to /site/public/js/user/auth/pretendLoginButton.js

import { setCurrentUserId } from './authUtils.js';
import { setUserOnline } from './api.js';
import { initProfile } from "../profile/profile.js";

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
		setCurrentUserId(2);
		setUserOnline().catch(e => console.warn('[auth] setUserOnline failed', e));
		// console.log('User data stored: id = 2');
		window.location.hash = '#profile';
		initProfile().catch((e) => console.warn('[profile] init after register failed', e));

	});
}

wirePretendLoginButton();

