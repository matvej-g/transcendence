// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

import { getPublicProfile, checkIfFriends } from './api.js';
import { logger } from '../../utils/logger.js';
import { getCurrentUserId } from '../auth/authUtils.js';

// Load and display friend profile data
export async function loadFriendProfile(userId: number): Promise<void> {
  try {
    // Check if viewing own profile
    const currentUserId = getCurrentUserId();
    if (currentUserId && Number(currentUserId) === userId) {
      // Redirect to own profile
      window.location.hash = '#profile';
      return;
    }

    // Check if users are friends
    const areFriends = await checkIfFriends(userId);
    if (!areFriends) {
      logger.warn('[friendProfile] Attempted to view non-friend profile');
      const usernameEl = document.getElementById('friend-username');
      if (usernameEl) {
        usernameEl.textContent = 'You can only view profiles of your friends';
      }
      // Optionally redirect to friends page
      setTimeout(() => {
        window.location.hash = '#friends';
      }, 2000);
      return;
    }

    const data = await getPublicProfile(userId);
    
    // Update username
    const usernameEl = document.getElementById('friend-username');
    if (usernameEl) {
      usernameEl.textContent = sanitizeString(data.displayname || data.username || 'Unknown');
    }
    
    // Update avatar
    const avatarImg = document.getElementById('friend-profile-avatar') as HTMLImageElement | null;
    if (avatarImg) {
      const avatarFilename = data.avatar_filename || 'default.jpg';
      avatarImg.src = `/uploads/avatars/${encodeURIComponent(avatarFilename)}`;
    }
    
    // Update stats
    const stats = data.stats || {};
    const wins = stats.wins || 0;
    const losses = stats.losses || 0;
    const tournamentsPlayed = stats.tournaments_played || 0;
    const tournamentsWon = stats.tournaments_won || 0;
    
    document.getElementById('friend-match-wins')!.textContent = `${wins}`;
    document.getElementById('friend-match-losses')!.textContent = `${losses}`;
    document.getElementById('friend-tourn-wins')!.textContent = `${tournamentsWon}`;
    document.getElementById('friend-tourn-losses')!.textContent = `${tournamentsPlayed - tournamentsWon}`;
    
    // Calculate winning rates
    const matchTotal = wins + losses;
    let matchRate = '0%';
    if (matchTotal > 0) {
      matchRate = ((wins / matchTotal) * 100).toFixed(1) + '%';
    }
    document.getElementById('friend-match-winning-rate')!.textContent = matchRate;
    
    let tournRate = '0%';
    if (tournamentsPlayed > 0) {
      tournRate = ((tournamentsWon / tournamentsPlayed) * 100).toFixed(1) + '%';
    }
    document.getElementById('friend-tourn-winning-rate')!.textContent = tournRate;
    
    // Render match history
    renderFriendMatchHistory(data.matches || [], userId);
    
  } catch (error) {
    logger.error('[friendProfile] Failed to load friend profile:', error);
    // Set error state in UI
    const usernameEl = document.getElementById('friend-username');
    if (usernameEl) {
      usernameEl.textContent = 'Error loading profile';
    }
  }
}

// Render match history for the friend
function renderFriendMatchHistory(matches: any[], friendUserId: number): void {
  const list = document.getElementById('friend-match-history-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (!Array.isArray(matches) || matches.length === 0) {
    const li = document.createElement('li');
    li.className = 'text-gray-400 text-center py-2';
    li.textContent = 'No matches yet';
    list.appendChild(li);
    return;
  }
  
  // Sort by started_at descending
  const sortedMatches = [...matches].sort((a: any, b: any) => 
    (b.started_at || '').localeCompare(a.started_at || '')
  );
  
  for (const match of sortedMatches) {
    const isPlayerOne = match.player_one_id === friendUserId;
    const playerScore = isPlayerOne ? match.score_player_one : match.score_player_two;
    const opponentScore = isPlayerOne ? match.score_player_two : match.score_player_one;
    const date = match.started_at ? new Date(match.started_at).toLocaleString() : '';
    const playerUsername = isPlayerOne ? match.player_one_displayname : match.player_two_displayname;
    const opponentUsername = isPlayerOne ? match.player_two_displayname : match.player_one_displayname;
    
    // Truncate usernames if too long
    const trunc = (s: string) => s && s.length > 12 ? s.slice(0, 10) + '…' : s;
    
    const li = document.createElement('li');
    li.className = 'match-item w-full flex justify-between py-1';
    li.innerHTML = `
      <div class="date-time text-emerald-400 flex w-[50%]">${sanitizeString(date)}</div>
      <div class="match-middle flex gap-4 w-[50%] mx-5">
        <div class="truncate">${sanitizeString(trunc(playerUsername))}</div>
        <div>:</div>
        <div class="truncate">${sanitizeString(trunc(opponentUsername))}</div>
      </div>
      <div class="text-emerald-400">${playerScore}:${opponentScore}</div>
    `;
    list.appendChild(li);
  }
}

// export { loadFriendProfile };
