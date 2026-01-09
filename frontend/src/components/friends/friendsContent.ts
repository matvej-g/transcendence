import { populateRequestsList } from './requestsList.js';
import { populateFriendsList } from './friendsList.js';

export function initFriendsSection() {
	const friendsSection = document.getElementById('friends-section');
	if (!friendsSection) return;
	populateRequestsList();
	populateFriendsList();
}
