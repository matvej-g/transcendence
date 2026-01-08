// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';
import { getUserByUserId } from './api.js';
import { renderMatchHistory } from './matchHistory.js';
import { fetchUserWinsAndLosses } from './stats.js';


// profile initializer: fetch user data and populate all data-field elements
async function initProfile(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('[profile] no userId');
    return;
  }
  const callerUserId = userId; // capture to detect races
  console.log('[profile] initProfile → userId', callerUserId);
  try {
    const data = await getUserByUserId(userId);
    console.log('[profile] initProfile → fetched user', data);
    const username = data?.username ?? null;
    if (!username) return;

    // avoid replacing UI if user changed during async fetch (race)
    const stillCurrent = getCurrentUserId();
    if (stillCurrent !== callerUserId) {
      console.warn('[profile] initProfile aborted — current user changed', { callerUserId, stillCurrent });
      return;
    }

    // insert username
    document.getElementById('username')!.textContent = `${username}`;

    // insert avatar
    const avatarImg = document.getElementById('profile-avatar') as HTMLImageElement | null;
    if (avatarImg) {
      const avatarFilename = data?.avatar_filename;
      console.log('avater filename:', avatarFilename);

    if (avatarFilename) {
        avatarImg.src = `/uploads/avatars/${avatarFilename}`;
      } else {
        console.error('avater filename not found');
        return;
      }
    }

    // insert stats...
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
      console.warn('[profile] Could not fetch user stats', e);
    }

  } catch (e) {
    console.warn('[profile] error', e);
  }
}

// Run on module load only when a user is present
const _currentUserId = getCurrentUserId();
if (_currentUserId) {
  initProfile().catch(e => console.warn('[profile] init failed', e));
  renderMatchHistory().catch(e => console.warn('[profile] match history failed', e));
}

export { initProfile };

