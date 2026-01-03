// Get user by ID
export async function getUserByUserId(userId: string | null) {
  if (userId == null)
  {
    throw new Error('User not found');
  }
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

// Get all matches
export async function getMatches() {
  const res = await fetch('/api/matches');
  if (!res.ok) throw new Error('Could not fetch matches');
  return await res.json();
}


