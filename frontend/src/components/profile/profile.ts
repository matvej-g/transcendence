
// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';

// profile initializer: fetch user id=1 and populate nickname
async function initProfile(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId){
    console.warn('[profile] no userId');
      return;
  }
  try {
    const res = await fetch(`/api/user/${userId}`, { method: 'GET' });
    if (!res.ok) {
      console.warn('[profile] fetch failed', res.status);
      return;
    }
    const data = await res.json();
    // backend returns the user object directly
    const username = data?.username ?? data?.userName ?? null;
    if (!username)
      return;

    // main avatar name
    //.querySelector() is a DOM method that finds and returns the first element matching the specified CSS selector
    const nameEl = document.querySelector('.avatar-name h2') as HTMLElement | null;
    if (nameEl)
      nameEl.textContent = username;

    //breplace placeholders in match-history and other nickname slots
    document.querySelectorAll('.nickname').forEach(el => {
      if (el.textContent && el.textContent.trim().toLowerCase() === 'nickname') {
        el.textContent = username;
      }
    });
  } catch (e) {
    console.warn('[profile] error', e);
  }
}

// Run on module load — safe to run even if profile section is hidden
initProfile().catch(e => console.warn('[profile] init failed', e));

export { initProfile };
