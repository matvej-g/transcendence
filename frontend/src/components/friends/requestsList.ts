import { getFriends, updateFriendStatus } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import type {FriendRequest} from '../../common/types.js'


// Helper to create a request list item
function createRequestItem(request: FriendRequest) {
	const li = document.createElement('li');
	li.className = 'friend-request-item my-3 flex flex-wrap items-center gap-5';
	li.dataset.nickname = request.friend.username || '';

	const img = document.createElement('img');
	img.className = 'avatar text-white h-8 w-auto';
	img.src = request.friend.avatarUrl || 'profile_avatar.jpg';
	img.alt = 'Avatar image';

	const h2 = document.createElement('h2');
	h2.className = 'text-emerald-400';
	h2.textContent = request.friend.username || '';

	const acceptBtn = document.createElement('button');
	acceptBtn.className = 'accept-request rounded bg-green-600 hover:bg-green-700 px-3';
	acceptBtn.textContent = 'accept';
	acceptBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await updateFriendStatus(String(request.id), Number(userId), { status: 'accepted' });
			li.remove();
		} catch (e) {
			alert('Failed to accept request');
		}
	};

	const refuseBtn = document.createElement('button');
	refuseBtn.className = 'refuse-request rounded bg-red-600 hover:bg-red-700 px-3';
	refuseBtn.textContent = 'refuse';
	refuseBtn.onclick = async () => {
		try {
			const userId = getCurrentUserId();
			await updateFriendStatus(String(request.id), Number(userId), { status: 'blocked' });
			li.remove();
		} catch (e) {
			alert('Failed to refuse request');
		}
	};

	li.appendChild(img);
	li.appendChild(h2);
	li.appendChild(acceptBtn);
	li.appendChild(refuseBtn);
	return li;
}

// Main logic to populate requests-list
export async function populateRequestsList() {
	const ul = document.getElementById('requests-list');
	if (!ul) return;
	ul.innerHTML = '';
	const userId = getCurrentUserId && getCurrentUserId();
	if (!userId) {
		ul.innerHTML = '<li class="text-red-400">No user ID found</li>';
		return;
	}
	try {
		console.log("user Id: ", userId);
		const friends: FriendRequest[] = await getFriends(Number(userId));
		// Only show requests where status is 'pending' and the current user is the recipient
		const pending = friends.filter((f: FriendRequest) => f.status === 'pending');
		for (const req of pending) {
			ul.appendChild(createRequestItem(req));
		}
		if (pending.length === 0) {
			const li = document.createElement('li');
			li.textContent = 'No friend requests.';
			li.className = 'text-gray-400';
			ul.appendChild(li);
		}
	} catch (e) {
		ul.innerHTML = '<li class="text-red-400">Failed to load requests</li>';
	}
}

// Auto-run on load
function onFriendsSectionShown() {
	const friendsSection = document.getElementById('friends-section');
	if (!friendsSection) return;
	// If already visible on load (e.g. after refresh), populate immediately
	if (!friendsSection.classList.contains('hidden')) {
		populateRequestsList();
	}
	// Use a MutationObserver to detect when the section becomes visible
	const observer = new MutationObserver(() => {
		if (!friendsSection.classList.contains('hidden')) {
			populateRequestsList();
		}
	});
	observer.observe(friendsSection, { attributes: true, attributeFilter: ['class'] });
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', onFriendsSectionShown);
} else {
	onFriendsSectionShown();
}
