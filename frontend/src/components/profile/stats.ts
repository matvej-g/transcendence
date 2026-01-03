import { getUserStats } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';

// Fetch and export wins and losses for the current user
export async function fetchUserWinsAndLosses() {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('No user logged in');
  const stats = await getUserStats(userId);
  // If backend returns { success: true, data: { ... } }
  const data = stats.data || stats;
  return {
    wins: data.wins ?? 0,
    losses: data.losses ?? 0
  };
}
