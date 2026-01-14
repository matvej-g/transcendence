import { getFriends, blockUser, getUserStatus } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import type { FriendRequest } from '../../common/types.js';
import { t } from '../languages/i18n.js';

async function createFriendItem(friend: FriendRequest) {
	const li = document.createElement('li');
	li.className = 'friend-item my-3 flex flex-wrap items-center gap-5';
	li.dataset.nickname = friend.friend.displayname || '';

	const img = document.createElement('img');
	img.className = 'avatar text-white h-8 w-auto';
	img.src = `/uploads/avatars/${friend.friend.avatar_filename}`;
	img.alt = 'Avatar image';

	const h2 = document.createElement('h2');
	h2.className = 'text-emerald-400';
	h2.textContent = friend.friend.displayname || '';

	// Online status span
	const statusSpan = document.createElement('span');
	statusSpan.className = 'online-status ml-2';
	try {
		const status = await getUserStatus(String(friend.friend.id));
		if (status && status.online) {
			statusSpan.dataset.i18n = 'friends.online';
			statusSpan.textContent = t('friends.online');
			statusSpan.classList.add('text-green-600');
		} else {
			statusSpan.dataset.i18n = 'friends.offline';
			statusSpan.textContent = t('friends.offline');
			statusSpan.classList.add('text-gray-400');
		}
	} catch (e) {
		statusSpan.dataset.i18n = 'friends.unknown';
		statusSpan.textContent = t('friends.unknown');
		statusSpan.classList.add('text-gray-400');
	}

	const blockBtn = document.createElement('button');
	blockBtn.className = 'block-friend rounded bg-red-600 hover:bg-red-700 px-3';
	blockBtn.dataset.i18n = 'friends.block_user';
	blockBtn.textContent = t('friends.block_user');
	blockBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await blockUser(friend.friend.id, Number(userId));
			await populateFriendsList();
		} catch (e) {
			alert('Failed to block friend');
		}
	};

	li.appendChild(img);
	li.appendChild(h2);
	li.appendChild(statusSpan);
	li.appendChild(blockBtn);
	return li;
}

// Main logic to populate friends-list
export async function populateFriendsList() {
	const ul = document.getElementById('friends-list');
	if (!ul) return;
	ul.innerHTML = '';
	const userId = getCurrentUserId && getCurrentUserId();
	if (!userId) {
		ul.innerHTML = `<li class="text-red-400" data-i18n="friends.no_user_id_found">${t('friends.no_user_id_found')}</li>`;
		return;
	}
	try {
		const friends: FriendRequest[] = await getFriends(Number(userId));
		// Only show friends where status is 'accepted'
		const accepted = friends.filter((f: FriendRequest) => f.status === 'accepted');
		for (const fr of accepted) {
			createFriendItem(fr).then(item => ul.appendChild(item));
		}
		if (accepted.length === 0) {
			const li = document.createElement('li');
			li.dataset.i18n = 'friends.no_friends_yet';
			li.textContent = t('friends.no_friends_yet');
			li.className = 'text-gray-400';
			ul.appendChild(li);
		}
	} catch (e) {
		ul.innerHTML = '<li class="text-red-400" data-i18n="friends.failed_to_load">Failed to load friends</li>';
	}
}
