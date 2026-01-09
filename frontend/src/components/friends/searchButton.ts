
import { getUserByUserId, getUserByUsername } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import { setupAddFriendButton } from './AddFriendButton.js';


const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const searchButton = document.getElementById('search-button');
const searchResultMessage = document.getElementById('search-result-message');
const searchResultUser = document.getElementById('search-result-user');
const searchResultAvatar = document.getElementById('search-result-avatar') as HTMLImageElement | null;
const searchResultNickname = document.getElementById('search-result-nickname');
const addFriendBtn = document.getElementById('add-friend-btn');


let friendUser: any = null;

function showMessage(text: string, colorClass: string) {
  if (!searchResultMessage) return;
  searchResultMessage.textContent = text;
  searchResultMessage.classList.remove('text-green-500', 'text-red-400');
  searchResultMessage.classList.add(colorClass);
  searchResultMessage.style.opacity = '1';
  if ((showMessage as any).timeout) clearTimeout((showMessage as any).timeout);
  (showMessage as any).timeout = setTimeout(() => {
    searchResultMessage.style.transition = 'opacity 0.5s';
    searchResultMessage.style.opacity = '0';
  }, 2500);
}

function handleSearchButtonClick() {
  if (!searchButton || !searchInput || !searchResultMessage || !searchResultUser || !searchResultAvatar || !searchResultNickname || !addFriendBtn) return;
  searchButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const username = searchInput.value.trim().replace(/\s+/g, ' ');
    searchResultMessage.textContent = '';
    searchResultMessage.classList.remove('text-green-500', 'text-red-400');
    searchResultMessage.style.opacity = '1';
    searchResultUser.classList.add('hidden');
    addFriendBtn.classList.remove('hidden');
    if (!username) {
      showMessage('Please enter a username.', 'text-red-400');
      return;
    }
    try {
      const user = await getUserByUsername(username);
      friendUser = user;
      const currentUserId = getCurrentUserId();
      const currentUser = await getUserByUserId(currentUserId);
      const currentNickname = currentUser.username;
      const foundNickname = user.username;
      const foundDisplayname = user.displayname;
      if (
        (currentUserId && (user.id === currentUserId || user.userId === currentUserId)) ||
        (currentNickname && foundNickname && currentNickname === foundNickname)
      ) {
        showMessage('You cannot send a friend request to yourself.', 'text-red-400');
        searchResultUser.classList.add('hidden');
        addFriendBtn.classList.add('hidden');
        return;
      }
      searchResultNickname.textContent = foundDisplayname;
      searchInput.value = "";
      if (user.avatar_filename && searchResultAvatar)
        searchResultAvatar.src = `/uploads/avatars/${user.avatar_filename}`;
      searchResultUser.classList.remove('hidden');
      addFriendBtn.classList.remove('hidden');
    } catch (err) {
      friendUser = null;
      showMessage('User not found.', 'text-red-400');
      searchResultUser.classList.add('hidden');
      addFriendBtn.classList.add('hidden');
      searchInput.value = "";
    }
  });
}

function handleSearchInputEnter() {
  if (!searchInput || !searchButton) return;
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchButton.click();
    }
  });
}

function getFriendUser() {
  return friendUser;
}

function init() {
  if (
    searchButton && searchInput && searchResultMessage && searchResultUser &&
    searchResultAvatar && searchResultNickname && addFriendBtn
  ) {
    handleSearchInputEnter();
    handleSearchButtonClick();
    setupAddFriendButton(addFriendBtn, searchResultUser, showMessage, getFriendUser);
  }
}

init();
