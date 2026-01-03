
// initProfile is declared with async, meaning it runs asynchronously and automatically returns
// a Promise<void>. The function body can use await to pause until async work completes.

import { getCurrentUserId } from '../auth/authUtils.js';
import { getUserByUserId, getMatches } from './api.js';

// Helper to fetch username by userId (cache to avoid duplicate requests)
const usernameCache: Record<string, string> = {};
async function fetchUsername(userId: number | string): Promise<string> {
  if (usernameCache[userId]) return usernameCache[userId];
  try {
    const user = await getUserByUserId(String(userId));
    usernameCache[userId] = user.username;
    return user.username;
  } catch {
    return `User#${userId}`;
  }
}

// Render match history for the current user
async function renderMatchHistory(): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;
  let matches;
  try {
    matches = await getMatches();
  } catch (e) {
    console.warn('[profile] Could not fetch matches', e);
    return;
  }
  if (!Array.isArray(matches)) return;
  const userIdNum = Number(userId);
  // Filter matches where user is player_one or player_two
  const userMatches = matches.filter((m: any) => m.player_one_id == userIdNum || m.player_two_id == userIdNum);
  // Sort by started_at descending
  userMatches.sort((a: any, b: any) => (b.started_at || '').localeCompare(a.started_at || ''));
  const list = document.getElementById('match-history-list');
  if (!list) return;
  list.innerHTML = '';
  for (const match of userMatches) {
    const isPlayerOne = match.player_one_id == userIdNum;
    const opponentId = isPlayerOne ? match.player_two_id : match.player_one_id;
    const playerScore = isPlayerOne ? match.score_player_one : match.score_player_two;
    const opponentScore = isPlayerOne ? match.score_player_two : match.score_player_one;
    const date = match.started_at ? new Date(match.started_at).toLocaleString() : '';
    const playerUsername = await fetchUsername(isPlayerOne ? match.player_one_id : match.player_two_id);
    const opponentUsername = await fetchUsername(opponentId);
    // Truncate usernames if too long
    const trunc = (s: string) => s.length > 12 ? s.slice(0, 10) + '…' : s;
    const li = document.createElement('li');
    li.className = 'match-item w-full flex justify-between py-1';
    li.innerHTML = `
      <div class="date-time text-emerald-400 flex w-[50%]">${date}</div>
      <div class="match-middle flex gap-4 w-[50%] mx-5">
        <div class="truncate">${trunc(playerUsername)}</div>
        <div>:</div>
        <div class="truncate">${trunc(opponentUsername)}</div>
      </div>
      <div class="text-emerald-400">${playerScore}:${opponentScore}</div>
    `;
    list.appendChild(li);
  }
}

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

export { initProfile, renderMatchHistory };

