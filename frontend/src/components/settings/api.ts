// Upload avatar
export async function uploadAvatar(userId: number | string, avatarFile: File): Promise<any> {
	const formData = new FormData();
	formData.append('avatar', avatarFile);
	const res = await fetch(`/api/user/${userId}/uploadAvatar`, {
		method: 'POST',
		body: formData,
	});
	return res.json();
}

import { UpdateUserParams, ChangePasswordParams } from '../../common/types';

export async function updateUser({ id, userName, email, password }: UpdateUserParams): Promise<any> {
	const body = { id, userName, email, password };
	const res = await fetch('/api/user/update', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
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
	});
	return res.json();
}
