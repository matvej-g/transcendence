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

	btn.addEventListener('click', async () => {
		console.log('[UI] pretendLogin → clearing JWT and navigating to #profile');
		
		// Clear JWT cookie before pretend login
		try {
			const response = await fetch('/api/user/logout', {
				method: 'POST',
				credentials: 'include'
			});
			if (!response.ok) {
				console.warn('Logout endpoint returned error, but continuing');
			}
		} catch (error) {
			console.error('Logout failed:', error);
		}

		navigateToLandingPage(null);
	});
}

wirePretendLoginButton();

