import { uploadAvatar } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import { reloadAvatar } from '../profile/profile.js';

// Modal elements
const uploadAvatarModal = document.getElementById('settings-upload-avatar');
const openUploadAvatarBtn = document.getElementById('open-upload-avatar');
const cancelUploadAvatarBtn = document.getElementById('cancel-upload-avatar');
const uploadAvatarForm = document.getElementById('upload-avatar-form') as HTMLFormElement | null;
const avatarFileInput = document.getElementById('avatar-file') as HTMLInputElement | null;
const uploadAvatarError = document.getElementById('upload-avatar-error');
const profileAvatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;

// Open modal from profile button
if (openUploadAvatarBtn && uploadAvatarModal) {
	openUploadAvatarBtn.addEventListener('click', () => {
		window.location.hash = '#settings/upload-avatar';
	});
}

// Cancel button closes modal
if (cancelUploadAvatarBtn && uploadAvatarModal) {
	cancelUploadAvatarBtn.addEventListener('click', () => {
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
				window.location.hash = '#profile';
				setTimeout(() => {
					reloadAvatar();
				}, 100);
			} else {
				if (uploadAvatarError) uploadAvatarError.textContent = result?.error || 'Upload failed.';
			}
		} catch (err: any) {
			if (uploadAvatarError) uploadAvatarError.textContent = err?.message || 'Upload failed.';
		}
	});
}
