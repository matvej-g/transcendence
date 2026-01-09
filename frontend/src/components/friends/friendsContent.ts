import { populateRequestsList } from './requestsList.js';
import { populateFriendsList } from './friendsList.js';

export function onFriendsSectionShown() {
	const friendsSection = document.getElementById('friends-section');
	if (!friendsSection) return;
	populateRequestsList(); //todo: only reload if new requests
	populateFriendsList();	//todo: only reload if new friends
}
