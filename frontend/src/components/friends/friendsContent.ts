import { getCurrentUserId } from '../auth/authUtils.js';
import { appWs } from '../../ws/appWs.js';

// Centralized WebSocket listeners for friends page
appWs.on((ev) => {
	const currentUserId = getCurrentUserId();
	// Friend request created
	if (ev.type === 'friend.request.created' && currentUserId && String(ev.data?.toUserId) === String(currentUserId)) {
		alert('You received a friend request.');
		populateRequestsList();
	}
	// Friend request accepted
	else if (ev.type === 'friend.request.accepted' && currentUserId && (String(ev.data?.toUserId) === String(currentUserId))) {
		alert('Your friend request was accepted');
		populateFriendsList();
	}
	// Friend request rejected
	else if (ev.type === 'friend.request.rejected' && currentUserId && (String(ev.data?.toUserId) === String(currentUserId))) {
		alert('Your friend request was rejected');
	}
	// Friend request blocked
	else if (ev.type === 'friend.request.blocked' && currentUserId && (String(ev.data?.blockedId) === String(currentUserId))) {
		alert('A user has blocked you.');
		initFriendsSection();
	}
});
import { populateRequestsList } from './requestsList.js';
import { populateFriendsList } from './friendsList.js';

export function initFriendsSection() {
	const friendsSection = document.getElementById('friends-section');
	if (!friendsSection) return;
	populateRequestsList();
	populateFriendsList();
}
