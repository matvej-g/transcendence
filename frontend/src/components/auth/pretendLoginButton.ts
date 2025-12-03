// Compiles to /site/public/js/user/auth/pretendLoginButton.js

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

		// Use hash navigation to trigger the SPA router in index-profile.html
		try {
			window.location.hash = '#profile';
		} catch (e) {
			console.warn('[pretendLoginButton] failed to set hash', e);
		}

		// Fallback: if the router isn't present, directly reveal the main UI pieces
		const navbar = document.getElementById('navbar');
		const footer = document.getElementById('footer');
		const profile = document.getElementById('profile-section');
		const auth = document.getElementById('auth-section');

		if (auth) auth.classList.add('hidden');
		if (profile) profile.classList.remove('hidden');
		if (navbar) navbar.classList.remove('hidden');
		if (footer) footer.classList.remove('hidden');
	});
}

wirePretendLoginButton();

