// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}
// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';
import { getUserByUserId } from './api.js';
import { renderMatchHistory } from './matchHistory.js';
import { fetchUserWinsAndLosses } from './stats.js';

import { logger } from '../../utils/logger.js';

// Reload only the username
export async function reloadUsername(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const data = await getUserByUserId(userId);
    const username = data?.displayname ?? null;
    if (!username) return;
    document.getElementById('username')!.textContent = sanitizeString(`${username}`);
  } catch (e) {
    logger.warn('[profile] reloadUsername error', e);
  }
}

// Reload only the avatar
export async function reloadAvatar(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;
  try {
    const data = await getUserByUserId(userId);
    const avatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;
    if (avatarImg) {
      const avatarFilename = data?.avatar_filename;
      if (avatarFilename) {
        // Use encodeURIComponent to prevent injection and ensure safe URLs
        avatarImg.src = `/uploads/avatars/${encodeURIComponent(avatarFilename || '')}`;
      } else {
        avatarImg.src = '';
        logger.error('avatar filename not found');
      }
    }
  } catch (e) {
    logger.warn('[profile] reloadAvatar error', e);
  }
}

// Reload only the stats
export async function reloadStats(): Promise<void> {
  try {
    const { wins, losses, tournaments_played, tournaments_won } = await fetchUserWinsAndLosses();
    document.getElementById('match-wins')!.textContent = `${wins}`;
    document.getElementById('match-losses')!.textContent = `${losses}`;
    document.getElementById('tourn-wins')!.textContent = `${tournaments_won}`;
    document.getElementById('tourn-losses')!.textContent = `${tournaments_played - tournaments_won}`;
    const matchTotal = wins + losses;
    let matchRate = '0%';
    if (matchTotal > 0) {
      matchRate = ((wins / matchTotal) * 100).toFixed(1) + '%';
    }
    document.getElementById('match-winning-rate')!.textContent = matchRate;
    let tournRate = '0%';
    if (tournaments_played > 0) {
      tournRate = ((tournaments_won / tournaments_played) * 100).toFixed(1) + '%';
    }
    document.getElementById('tourn-winning-rate')!.textContent = tournRate;
  } catch (e) {
    document.getElementById('match-wins')!.textContent = '?';
    document.getElementById('match-losses')!.textContent = '?';
    document.getElementById('match-winning-rate')!.textContent = '?';
    document.getElementById('tourn-wins')!.textContent = '?';
    document.getElementById('tourn-losses')!.textContent = '?';
    document.getElementById('tourn-winning-rate')!.textContent = '?';
    logger.warn('[profile] reloadStats error', e);
  }
}

// Reload only the match history
export async function reloadMatchHistory(): Promise<void> {
  try {
    await renderMatchHistory();
  } catch (e) {
    logger.warn('[profile] reloadMatchHistory error', e);
  }
}

// Optionally, keep the old initProfile for legacy use
async function initProfile(): Promise<void> {
  await Promise.all([
    reloadUsername(),
    reloadAvatar(),
    reloadStats(),
    reloadMatchHistory()
  ]);
}

export { initProfile };

