import { getFriends, updateFriendStatus, blockUser, declineFriendRequest } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import type {FriendRequest} from '../../common/types.js'
import { t } from '../languages/i18n.js';


import { populateFriendsList } from './friendsList.js';
// Helper to create a request list item
function createRequestItem(request: FriendRequest) {
	const li = document.createElement('li');
	li.className = 'friend-request-item my-3 flex flex-wrap items-center gap-5';
	li.dataset.nickname = request.friend.displayname || '';

	const img = document.createElement('img');
	img.className = 'avatar text-white h-8 w-auto';
	img.src = `/uploads/avatars/${request.friend.avatar_filename}`;
	img.alt = 'Avatar image';

	const h2 = document.createElement('h2');
	h2.className = 'text-emerald-400';
	h2.textContent = request.friend.displayname || '';

	const reloadLists = async () => {
		await populateRequestsList();
		await populateFriendsList();
	};

	const acceptBtn = document.createElement('button');
	acceptBtn.className = 'accept-request rounded bg-green-600 hover:bg-green-700 px-3';
	acceptBtn.dataset.i18n = 'friends.accept';
	acceptBtn.textContent = t('friends.accept');
	acceptBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await updateFriendStatus(String(request.friendshipId), Number(userId), { status: 'accepted' });
			await reloadLists();
		} catch (e) {
			alert('Failed to accept request');
		}
	};

	const declineBtn = document.createElement('button');
	declineBtn.className = 'decline-request rounded bg-yellow-500 hover:bg-yellow-600 px-3';
	declineBtn.dataset.i18n = 'friends.decline';
	declineBtn.textContent = t('friends.decline');
	declineBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await declineFriendRequest(request.friendshipId, Number(userId));
			await reloadLists();
		} catch (e) {
			alert('Failed to decline request');
		}
	};

	const blockBtn = document.createElement('button');
	blockBtn.className = 'block-request rounded bg-red-600 hover:bg-red-700 px-3';
	blockBtn.dataset.i18n = 'friends.block_user';
	blockBtn.textContent = t('friends.block_user');
	blockBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await blockUser(request.friend.id, Number(userId));
			await reloadLists();
		} catch (e) {
			alert('Failed to block user');
		}
	};

	li.appendChild(img);
	li.appendChild(h2);
	li.appendChild(acceptBtn);
	li.appendChild(declineBtn);
	li.appendChild(blockBtn);
	return li;
}

// Main logic to populate requests-list
export async function populateRequestsList() {
	const ul = document.getElementById('requests-list');
	if (!ul) return;
	ul.innerHTML = '';
	const userId = getCurrentUserId && getCurrentUserId();
	if (!userId) {
		ul.innerHTML = `<li class="text-red-400" data-i18n="friends.no_user_id_found">${t('friends.no_user_id_found')}</li>`;
		return;
	}
	try {
		console.log("user Id: ", userId);
		const friends: FriendRequest[] = await getFriends(Number(userId));
		// Only show requests where status is 'pending' and the current user is the recipient
		const pendingToMe = friends.filter((f: FriendRequest) => f.status === 'pending' && Number(userId) === f.receiverId);
		for (const req of pendingToMe) {
			ul.appendChild(createRequestItem(req));
		}
		if (pendingToMe.length === 0) {
			const li = document.createElement('li');
			li.dataset.i18n = 'friends.no_friend_requests';
			li.textContent = t('friends.no_friend_requests');
			li.className = 'text-gray-400';
			ul.appendChild(li);
		}
	} catch (e) {
		ul.innerHTML = `<li class="text-red-400" data-i18n="friends.failed_to_load_requests">${t('friends.failed_to_load_requests')}</li>`;
	}
}

