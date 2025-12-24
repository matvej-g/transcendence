import { getFriends, updateFriendStatus } from './api.js';

// Helper to create a request list item
function createRequestItem(request) {
	const li = document.createElement('li');
	li.className = 'friend-request-item my-3 flex flex-wrap items-center gap-5';
	li.dataset.nickname = request.friend.userName || request.friend.username || request.friend.name || '';

	const img = document.createElement('img');
	img.className = 'avatar text-white h-8 w-auto';
	img.src = request.friend.avatarUrl || 'profile_avatar.jpg';
	img.alt = 'Avatar image';

	const h2 = document.createElement('h2');
	h2.className = 'text-emerald-400';
	h2.textContent = request.friend.userName || request.friend.username || request.friend.name || '';

	const acceptBtn = document.createElement('button');
	acceptBtn.className = 'accept-request rounded bg-green-600 hover:bg-green-700 px-3';
	acceptBtn.textContent = 'accept';
	acceptBtn.onclick = async () => {
		try {
			await updateFriendStatus(request.id, { status: 'accepted' });
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
			await updateFriendStatus(request.id, { status: 'blocked' });
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
	try {
		const friends = await getFriends();
		// Only show requests where status is 'pending' and the current user is the recipient
		const pending = friends.filter(f => f.status === 'pending');
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
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', populateRequestsList);
} else {
	populateRequestsList();
}
