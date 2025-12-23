import { getUserByUserId, getUserByUsername } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import { sendFriendRequest } from './api.js';

const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const searchButton = document.getElementById('search-button');
const searchResultMessage = document.getElementById('search-result-message');
const searchResultUser = document.getElementById('search-result-user');
const searchResultAvatar = document.getElementById('search-result-avatar') as HTMLImageElement | null;
const searchResultNickname = document.getElementById('search-result-nickname');
const addFriendBtn = document.getElementById('add-friend-btn');

if (searchButton && searchInput && searchResultMessage && searchResultUser && searchResultAvatar && searchResultNickname && addFriendBtn) {
  // Allow pressing Enter to trigger search
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); //stops the default action of an event from happening.
      searchButton.click();
    }
  });

  let friendUser: any = null;

  searchButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = searchInput.value.trim();
    searchResultMessage.textContent = '';
    searchResultUser.classList.add('hidden');
    addFriendBtn.classList.remove('hidden');
    if (!username) {
      searchResultMessage.textContent = 'Please enter a username.';
      return;
    }
    try {
      const user = await getUserByUsername(username);
      friendUser = user;
      const currentUserId = getCurrentUserId();
      const currentUser = await getUserByUserId(currentUserId);
      const currentNickname = currentUser.username;
      const foundNickname = user.userName || user.username || user.name || username;
      if (
        (currentUserId && (user.id === currentUserId || user.userId === currentUserId)) ||
        (currentNickname && foundNickname && currentNickname === foundNickname)
      ) {
        searchResultMessage.textContent = 'You cannot send a friend request to yourself.';
        searchResultUser.classList.add('hidden');
        addFriendBtn.classList.add('hidden');
        return;
      }
      searchResultNickname.textContent = foundNickname;
      searchInput.value = "";
      if (user.avatarUrl && searchResultAvatar) {
        searchResultAvatar.src = user.avatarUrl;
      } else {
        searchResultAvatar.src = 'profile_avatar.jpg';
      }
      searchResultUser.classList.remove('hidden');
      addFriendBtn.classList.remove('hidden');
    } catch (err) {
      friendUser = null;
      searchResultMessage.textContent = 'User not found.';
      searchResultUser.classList.add('hidden');
      addFriendBtn.classList.add('hidden');
      searchInput.value = "";
    }
  });

  addFriendBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!friendUser || !friendUser.id) {
      searchResultMessage.textContent = 'No user selected.';
      return;
    }
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      searchResultMessage.textContent = 'Current user not found.';
      return;
    }
    try {
      await sendFriendRequest(Number(friendUser.id), Number(currentUserId));
      searchResultMessage.textContent = 'Friend request sent!';
      addFriendBtn.classList.add('hidden');
    } catch (err) {
      searchResultMessage.textContent = 'Failed to send friend request.';
    }
  });
}
