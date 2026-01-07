// Compiles to /site/public/js/user/auth/pretendLoginButton.js

import { setCurrentUserId, setUserOnline } from './authUtils.js';
import { initProfile } from "../profile/profile.js";

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

		// Now do the pretend login
		setCurrentUserId(2);
		setUserOnline().catch(e => console.warn('[auth] setUserOnline failed', e));
		window.location.hash = '#profile';
		initProfile().catch((e) => console.warn('[profile] init after register failed', e));
	});
}

wirePretendLoginButton();

