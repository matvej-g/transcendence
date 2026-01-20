// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

import { getCurrentUserId } from '../auth/authUtils.js';
import { getMatches } from './api.js';

// Render match history for the current user
export async function renderMatchHistory(): Promise<void> {
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
