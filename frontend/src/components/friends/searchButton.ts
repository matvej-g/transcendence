import { getUserByUserId, getUserByUsername } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';

const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const searchButton = document.getElementById('search-button');
const searchResultMessage = document.getElementById('search-result-message');
const searchResultUser = document.getElementById('search-result-user');
const searchResultAvatar = document.getElementById('search-result-avatar') as HTMLImageElement | null;
const searchResultNickname = document.getElementById('search-result-nickname');
const addFriendBtn = document.getElementById('add-friend-btn');

if (searchButton && searchInput && searchResultMessage && searchResultUser && searchResultAvatar && searchResultNickname && addFriendBtn) {
  searchButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = searchInput.value.trim();
    searchResultMessage.textContent = '';
    searchResultUser.classList.add('hidden');
    addFriendBtn.classList.remove('hidden'); // ensure button is visible by default
    if (!username) {
      searchResultMessage.textContent = 'Please enter a username.';
      return;
    }
    try {
      const user = await getUserByUsername(username);
      // Prevent sending request to yourself (by id or nickname)
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
      // Show user info
      searchResultNickname.textContent = foundNickname;
        // Clear the search input after use
        searchInput.value = "";
      if (user.avatarUrl && searchResultAvatar) {
        searchResultAvatar.src = user.avatarUrl;
      } else {
        searchResultAvatar.src = 'profile_avatar.jpg'; // fallback
      }
      searchResultUser.classList.remove('hidden');
      addFriendBtn.classList.remove('hidden');
    } catch (err) {
      searchResultMessage.textContent = 'User not found.';
      searchResultUser.classList.add('hidden');
      addFriendBtn.classList.add('hidden');
        // Clear the search input on error as well
        searchInput.value = "";
    }
  });
}
