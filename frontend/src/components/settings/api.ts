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

export async function updateUser({ id, userName, email, password }: UpdateUserParams): Promise<any> {
	const body = { id, userName, email, password };
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
