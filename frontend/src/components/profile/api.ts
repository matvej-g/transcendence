// Get user by ID
export async function getUserByUserId(userId: string | null) {
  if (userId == null)
  {
    throw new Error('User not found');
  }
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}`,{
     credentials: 'include'
  });
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

// Get all matches
export async function getMatches() {
  const res = await fetch('/api/matches', { credentials: 'include' });
  if (!res.ok) throw new Error('Could not fetch matches');
  return await res.json();
}

// Get user stats by user ID
export async function getUserStats(userId: string | number) {
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}/stats`, { credentials: 'include' });
  if (!res.ok) throw new Error('Could not fetch user stats');
  return await res.json();
}


