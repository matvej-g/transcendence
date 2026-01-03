
// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';
import { getUserByUserId } from './api.js';
import { renderMatchHistory } from './matchHistory.js';


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

    // insert stats...

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

