import { populateRequestsList } from './requestsList.js';
import { populateFriendsList } from './friendsList.js';

export function onFriendsSectionShown() {
	const friendsSection = document.getElementById('friends-section');
	if (!friendsSection) return;
	// If already visible on load (e.g. after refresh), populate immediately
	if (!friendsSection.classList.contains('hidden')) {
		populateRequestsList();
		populateFriendsList();
	}
	// Use a MutationObserver to detect when the section becomes visible
	const observer = new MutationObserver(() => {
		if (!friendsSection.classList.contains('hidden')) {
			populateRequestsList();
			populateFriendsList();
		}
	});
	observer.observe(friendsSection, { attributes: true, attributeFilter: ['class'] });
}
