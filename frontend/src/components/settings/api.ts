import { ChangeEmailParams } from '../../common/types';
import { logger } from '../../utils/logger.js';
// Change email
export async function changeEmail({ id, oldEmail, newEmail }: ChangeEmailParams): Promise<any> {
	const body = { id, oldEmail, newEmail };
	const res = await fetch('/api/user/changeEmail', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		credentials: 'include',
	});
	
	const text = await res.text();
	if (!text) {
		return { message: 'Email changed' };
	}
	try {
		return JSON.parse(text);
	} catch (e) {
		logger.error('Failed to parse response:', text);
		throw new Error('Invalid server response');
	}
}
// Upload avatar
export async function uploadAvatar(userId: number | string, avatarFile: File): Promise<any> {
	const formData = new FormData();
	formData.append('avatar', avatarFile);
	const res = await fetch(`/api/user/${userId}/uploadAvatar`, {
		method: 'POST',
		body: formData,
		credentials: 'include',
	});
	const contentType = res.headers.get('content-type') || '';
	if (!res.ok && res.status === 413) {
		// Nginx or server error (e.g. 413), try to show a friendly message
		throw new Error('File too large. Please select a smaller image.');
	}
	return res.json();
}

import { UpdateUserParams, ChangePasswordParams } from '../../common/types';

export async function updateUser({ id, userName}: UpdateUserParams): Promise<any> {
	const body = { id, userName};
	const res = await fetch('/api/user/update', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		credentials: 'include',
	});
	return res.json();
}

// Change password
export async function changePassword({ id, oldPassword, newPassword }: ChangePasswordParams): Promise<any> {
	const body = { id, oldPassword, newPassword };
	const res = await fetch('/api/user/changePassword', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		credentials: 'include',
	});
	return res.json();
}
