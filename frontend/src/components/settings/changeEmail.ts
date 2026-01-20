// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
	const temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
}
// import { updateEmail } from "./api.js";
import { getCurrentUserId } from '../auth/authUtils.js';
import { changeEmail } from './api.js';

// Elements
const modal = document.getElementById('settings-change-email');
const form = document.getElementById('change-email-form') as HTMLFormElement | null;
const input = document.getElementById('new-email') as HTMLInputElement | null;
const errorDiv = document.getElementById('change-email-error');
const cancelBtn = document.getElementById('cancel-change-email');

window.addEventListener('hashchange', async () => {
	if (window.location.hash === '#settings/change-email') {
		if (errorDiv) errorDiv.textContent = '';
		
		// Check if user is Google OAuth user
		const userId = getCurrentUserId();
		if (userId) {
			try {
				const res = await fetch(`/api/user/${userId}`, { credentials: 'include' });
				const userData = await res.json();
				const user = userData?.user || userData;
				
				if (user?.oauth_id) {
					// User is logged in with Google - show warning and disable form
					if (errorDiv) {
						errorDiv.innerHTML = `
							⚠️ <strong>Cannot change email for Google accounts.</strong><br>
							Your email is managed by Google.<br><br>
							<button onclick="window.location.hash='#profile'" 
									style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold;">
								← Back to Profile
							</button>
						`;
						errorDiv.style.color = '#f59e0b';
						errorDiv.style.marginBottom = '16px';
					}
					// Disable form inputs
					if (input) {
						input.disabled = true;
						input.style.opacity = '0.5';
						input.style.cursor = 'not-allowed';
					}
					// Disable submit button
					const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
					if (submitBtn) {
						submitBtn.disabled = true;
						submitBtn.style.opacity = '0.5';
						submitBtn.style.cursor = 'not-allowed';
					}
				} else {
					// Regular user - enable everything
					if (errorDiv) {
						errorDiv.textContent = '';
						errorDiv.style.marginBottom = '';
					}
					if (input) {
						input.disabled = false;
						input.style.opacity = '1';
						input.style.cursor = 'text';
						input.focus();
					}
					const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement;
					if (submitBtn) {
						submitBtn.disabled = false;
						submitBtn.style.opacity = '1';
						submitBtn.style.cursor = 'pointer';
					}
				}
			} catch (err) {
				console.error('Failed to check OAuth status:', err);
			}
		}
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
if (form) {
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!input) return;
		const newEmail = input.value.trim();
		if (!newEmail) {
			if (errorDiv) errorDiv.textContent = 'Email cannot be empty.';
			return;
		}
		const userId = getCurrentUserId();
		if (!userId) {
			if (errorDiv) errorDiv.textContent = 'Not logged in.';
			return;
		}
		try {
			// Fetch current user email from backend
			const userRes = await fetch(`/api/user/${userId}`, { credentials: 'include' });
			const userData = await userRes.json();
			const oldEmail = userData?.email || userData?.user?.email;
			if (!oldEmail) {
				if (errorDiv) errorDiv.textContent = 'Could not retrieve current email.';
				return;
			}
			const res = await changeEmail({ id: userId, oldEmail, newEmail });
			console.log(res);
			if (res && res.message === "Email changed") {
				alert("OK: Email changed.");
				window.location.hash = '#profile';
			} else if (res && res.message) {
				if (errorDiv) errorDiv.textContent = sanitizeString(res.message);
			} else if (res && res.error) {
				if (errorDiv) errorDiv.textContent = sanitizeString(res.error);
			} else {
				if (errorDiv) errorDiv.textContent = 'Failed to update email.';
			}
		} catch (err: any) {
			if (errorDiv) errorDiv.textContent = sanitizeString(err?.message) || 'Error updating username.';
		}
	});
}
