
// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';

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
    const res = await fetch(`/api/user/${userId}`, { method: 'GET' });
    if (!res.ok) {
      console.warn('[profile] fetch failed', res.status);
      return;
    }
    const data = await res.json();
    console.log('[profile] initProfile → fetched user', data);
    const username = data?.username ?? data?.userName ?? null;
    if (!username) return;

    // avoid replacing UI if user changed during async fetch (race)
    const stillCurrent = getCurrentUserId();
    if (stillCurrent !== callerUserId) {
      console.warn('[profile] initProfile aborted — current user changed', { callerUserId, stillCurrent });
      return;
    }

    // Fill all data-field elements in the profile
    document.querySelectorAll('[data-field]').forEach((el: Element) => {
      const fieldName = (el as HTMLElement).dataset.field;
      if (!fieldName) return;

      let value: string | undefined;
      switch (fieldName) {
        case 'username':
          value = username;
          break;
        case 'playerUsername':
          // For now, use the logged-in user's username for player slots
          value = username;
          break;
        // Add more field mappings as needed (opponentUsername, matchDateTime, matchScore, etc.)
      }

      if (value !== undefined) {
        (el as HTMLElement).textContent = value;
      }
    });
  } catch (e) {
    console.warn('[profile] error', e);
  }
}

// Run on module load only when a user is present
const _currentUserId = getCurrentUserId();
if (_currentUserId) {
  initProfile().catch(e => console.warn('[profile] init failed', e));
}

export { initProfile };
