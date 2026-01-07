
import { updateUser } from "./api.js";
import { getCurrentUserId, setCurrentUsername } from '../auth/authUtils.js';
import { initProfile } from "../profile/profile.js";

// Elements
const modal = document.getElementById('settings-edit-username');
const form = document.getElementById('edit-username-form') as HTMLFormElement | null;
const input = document.getElementById('new-username') as HTMLInputElement | null;
const errorDiv = document.getElementById('edit-username-error');
const cancelBtn = document.getElementById('cancel-edit-username');

// Listen for hash change to open modal
window.addEventListener('hashchange', () => {
	if (window.location.hash === '#settings/edit-username') {
		if (input) input.focus(); //puts cursor into input field
		if (errorDiv) errorDiv.textContent = '';
	}
});

// Cancel button closes modal (returns to profile or settings)
if (cancelBtn) {
	cancelBtn.addEventListener('click', (e) => {
		e.preventDefault(); //revents the browser from reloading the page or navigating away
		console.log("Cancel-Button clicked");
		window.location.hash = '#profile';
	});
}

// Form submit handler
if (form) {
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!input) return;
		const newUsername = input.value.trim();
		if (!newUsername) {
			if (errorDiv) errorDiv.textContent = 'Username cannot be empty.';
			return;
		}
		const userId = getCurrentUserId();
		if (!userId) {
			if (errorDiv) errorDiv.textContent = 'Not logged in.';
			return;
		}
		try {
			const res = await updateUser({ id: userId, userName: newUsername });
			console.log(res);
			if (res && res.displayname === newUsername) {
				setCurrentUsername(newUsername);
				alert("OK: Username set to " + newUsername);
				window.location.hash = '#profile';
				// Wait for hash navigation, then refresh profile
				setTimeout(() => {
					initProfile();
				}, 100);
			} else if (res && res.message) {
				if (errorDiv) errorDiv.textContent = res.message;
			} else {
				if (errorDiv) errorDiv.textContent = 'Failed to update username.';
			}
		} catch (err: any) {
			if (errorDiv) errorDiv.textContent = err?.message || 'Error updating username.';
		}
	});
}
