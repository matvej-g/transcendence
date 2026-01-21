// AddFriendButton.ts
// Handles the add friend button logic for the friends search UI

import { sendFriendRequest } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';

export function setupAddFriendButton(addFriendBtn: HTMLElement, searchResultUser: HTMLElement, showMessage: (msg: string, color: string) => void, getFriendUser: () => any) {
  addFriendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const friendUser = getFriendUser();
    if (!friendUser || !friendUser.id) {
      showMessage('No user selected.', 'text-red-400'); // todo translate
      return;
    }
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      showMessage('Current user not found.', 'text-red-400'); //todo translate
      return;
    }
    try {
      await sendFriendRequest(Number(friendUser.id), Number(currentUserId));
      showMessage('Friend request sent!', 'text-green-500'); //todo translate
      addFriendBtn.classList.add('hidden');
      searchResultUser.classList.add('hidden');
    } catch (err) {
      const errorMsg = (err as any)?.message || 'Friend request already exists or invalid'; // todo translate
      showMessage(errorMsg, 'text-red-400');
      searchResultUser.classList.add('hidden');
    }
  });
}
