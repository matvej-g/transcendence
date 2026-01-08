// import { updateEmail } from "./api.js";
import { getCurrentUserId } from '../auth/authUtils.js';
import { initProfile } from "../profile/profile.js";

// Elements
const modal = document.getElementById('settings-change-email');
const form = document.getElementById('change-email-form') as HTMLFormElement | null;
const input = document.getElementById('new-email') as HTMLInputElement | null;
const errorDiv = document.getElementById('change-email-error');
const cancelBtn = document.getElementById('cancel-change-email');

// Listen for hash change to open modal
window.addEventListener('hashchange', () => {
	if (window.location.hash === '#settings/change-email') {
		if (input) input.focus(); //puts cursor into input field
		if (errorDiv) errorDiv.textContent = '';
	}
});

// Cancel button closes modal (returns to profile or settings)
if (cancelBtn) {
	cancelBtn.addEventListener('click', (e) => {
		e.preventDefault(); //revents the browser from reloading the page or navigating away
		window.location.hash = '#profile';
	});
}


// Form submit handler
// if (form) {
// 	form.addEventListener('submit', async (e) => {
// 		e.preventDefault();
// 		if (!input) return;
// 		const newEmail = input.value.trim();
// 		if (!newEmail) {
// 			if (errorDiv) errorDiv.textContent = 'Email cannot be empty.';
// 			return;
// 		}
// 		const userId = getCurrentUserId();
// 		if (!userId) {
// 			if (errorDiv) errorDiv.textContent = 'Not logged in.';
// 			return;
// 		}
// 		try {
// 			const res = await updateEmail({ id: userId, userName: newEmail });
// 			console.log(res);
// 			if (res && res.email === newEmail) {
// 				alert("OK: Email set to " + newEmail);
// 				window.location.hash = '#profile';
// 			} else if (res && res.message) {
// 				if (errorDiv) errorDiv.textContent = res.message;
// 			} else if (res && res.error) {
// 				if (errorDiv) errorDiv.textContent = res.error;
// 			} else {
// 				if (errorDiv) errorDiv.textContent = 'Failed to update email.';
// 			}
// 		} catch (err: any) {
// 			if (errorDiv) errorDiv.textContent = err?.message || 'Error updating username.';
// 		}
// 	});
// }
