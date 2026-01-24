// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
	const temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
}
import { uploadAvatar } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import { reloadAvatar } from '../profile/profile.js';
import { t } from '../languages/i18n.js';

// Modal elements
const uploadAvatarModal = document.getElementById('settings-upload-avatar');
const openUploadAvatarBtn = document.getElementById('open-upload-avatar');
const cancelUploadAvatarBtn = document.getElementById('cancel-upload-avatar');
const uploadAvatarForm = document.getElementById('upload-avatar-form') as HTMLFormElement | null;
const avatarFileInput = document.getElementById('avatar-file') as HTMLInputElement | null;
const avatarFileBtn = document.getElementById('avatar-file-btn');
const avatarFileName = document.getElementById('avatar-file-name');
const uploadAvatarError = document.getElementById('upload-avatar-error');
const profileAvatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;

// Custom file button click triggers hidden file input
if (avatarFileBtn && avatarFileInput) {
	avatarFileBtn.addEventListener('click', () => {
		avatarFileInput.click();
	});
}

// Update filename display when file is selected
if (avatarFileInput && avatarFileName) {
	avatarFileInput.addEventListener('change', () => {
		if (avatarFileInput.files && avatarFileInput.files.length > 0) {
			avatarFileName.textContent = avatarFileInput.files[0].name;
			avatarFileName.classList.remove('text-gray-400');
			avatarFileName.classList.add('text-white');
		} else {
			avatarFileName.textContent = t('profile.avatar_no_file');
			avatarFileName.classList.remove('text-white');
			avatarFileName.classList.add('text-gray-400');
		}
	});
}

// Open modal from profile button
if (openUploadAvatarBtn && uploadAvatarModal) {
	openUploadAvatarBtn.addEventListener('click', () => {
		window.location.hash = '#settings/upload-avatar';
	});
}

// Cancel button closes modal and resets file input
if (cancelUploadAvatarBtn && uploadAvatarModal) {
	cancelUploadAvatarBtn.addEventListener('click', () => {
		// Reset file input and filename display
		if (avatarFileInput) avatarFileInput.value = '';
		if (avatarFileName) {
			avatarFileName.textContent = t('profile.avatar_no_file');
			avatarFileName.classList.remove('text-white');
			avatarFileName.classList.add('text-gray-400');
		}
		window.location.hash = '#profile';
	});
}

// Handle avatar upload form submit
if (uploadAvatarForm) {
	uploadAvatarForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!avatarFileInput || !avatarFileInput.files || avatarFileInput.files.length === 0) {
			if (uploadAvatarError) uploadAvatarError.textContent = 'Please select an image file.';
			return;
		}
		const file = avatarFileInput.files[0];
		const userId = getCurrentUserId();
		if (!userId) {
			if (uploadAvatarError) uploadAvatarError.textContent = 'User not found.';
			return;
		}
		try {
			if (uploadAvatarError) uploadAvatarError.textContent = '';
			const result = await uploadAvatar(userId, file);
			if (result && (result.success || result.avatar_filename)) {
				alert("OK: Uploaded avatar.");
				window.__profileReload = { avatar: true };
				window.location.hash = '#profile';
			} else {
				if (uploadAvatarError) uploadAvatarError.textContent = result?.error ? sanitizeString(result.error) : 'Upload failed.';
			}
		} catch (err: any) {
			if (uploadAvatarError) uploadAvatarError.textContent = err?.message ? sanitizeString(err.message) : 'Upload failed.';
		}
	});
}
