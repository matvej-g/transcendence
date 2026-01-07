// BlockButton.ts
// Reusable block user button for friends features

import { blockUser } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';

export function setupBlockButton(blockBtn: HTMLElement, searchResultUser: HTMLElement, showMessage: (msg: string, color: string) => void, getFriendUser: () => any) {
  blockBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const friendUser = getFriendUser();
    if (!friendUser || !friendUser.id) {
      showMessage('No user selected.', 'text-red-400');
      return;
    }
    try {
      const userId = getCurrentUserId();
      await blockUser(friendUser.id, Number(userId));
      showMessage('User blocked.', 'text-green-500');
      blockBtn.classList.add('hidden');
      searchResultUser.classList.add('hidden');
    } catch (e) {
      showMessage('Failed to block user.', 'text-red-400');
    }
  });
}
