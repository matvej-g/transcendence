import { getFriends, updateFriendStatus } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import type { FriendRequest } from '../../common/types.js';

// Helper to create a friend list item with delete button
function createFriendItem(friend: FriendRequest) {
	const li = document.createElement('li');
	li.className = 'friend-item my-3 flex flex-wrap items-center gap-5';
	li.dataset.nickname = friend.friend.username || '';

	const img = document.createElement('img');
	img.className = 'avatar text-white h-8 w-auto';
	img.src = `/uploads/avatars/${friend.friend.avatar_filename}`;
	img.alt = 'Avatar image';

	const h2 = document.createElement('h2');
	h2.className = 'text-emerald-400';
	h2.textContent = friend.friend.username || '';

	const deleteBtn = document.createElement('button');
	deleteBtn.className = 'delete-friend rounded bg-red-600 hover:bg-red-700 px-3';
	deleteBtn.textContent = 'delete';
	deleteBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await updateFriendStatus(String(friend.id), Number(userId), { status: 'blocked' });
			await populateFriendsList();
		} catch (e) {
			alert('Failed to delete friend');
		}
	};

	li.appendChild(img);
	li.appendChild(h2);
	li.appendChild(deleteBtn);
	return li;
}

// Main logic to populate friends-list
export async function populateFriendsList() {
	const ul = document.getElementById('friends-list');
	if (!ul) return;
	ul.innerHTML = '';
	const userId = getCurrentUserId && getCurrentUserId();
	if (!userId) {
		ul.innerHTML = '<li class="text-red-400">No user ID found</li>';
		return;
	}
	try {
		const friends: FriendRequest[] = await getFriends(Number(userId));
		// Only show friends where status is 'accepted'
		const accepted = friends.filter((f: FriendRequest) => f.status === 'accepted');
		for (const fr of accepted) {
			ul.appendChild(createFriendItem(fr));
		}
		if (accepted.length === 0) {
			const li = document.createElement('li');
			li.textContent = 'No friends yet.';
			li.className = 'text-gray-400';
			ul.appendChild(li);
		}
	} catch (e) {
		ul.innerHTML = '<li class="text-red-400">Failed to load friends</li>';
	}
}
