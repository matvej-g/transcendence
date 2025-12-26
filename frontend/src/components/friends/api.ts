// API functions for friends feature

// encodeURIComponent is used to safely include user input (like usernames or IDs)
// in URLs, preventing issues with spaces, symbols, or non-ASCII characters
// Get user by username
export async function getUserByUsername(userName: string) {
  const res = await fetch(`/api/user/${encodeURIComponent(userName)}`);
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

// Get user by ID
export async function getUserByUserId(userId: string | null) {
  if (userId == null)
  {
    throw new Error('User not found');
    return ;
  }
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

// Get friends list
export async function getFriends(userId: number) {
  const res = await fetch('/api/friends', {
    method: 'GET',
    headers: {'X-USER-ID': String(userId)}
  });
  if (!res.ok) throw new Error('Failed to fetch friends');
  return await res.json();
}

// Send friend request
export async function sendFriendRequest(friendId: number, userId: number) {
  const res = await fetch('/api/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': String(userId)
    },
    body: JSON.stringify({ friendId })
  });
  if (!res.ok) throw new Error('Failed to send friend request');
  return await res.json();
}

// Update friend request status (accept/refuse/delete)
export async function updateFriendStatus(friendshipId: string, userId: number, payload: { status: string }) {
  const res = await fetch(`/api/friends/${encodeURIComponent(friendshipId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': String(userId)
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update friend status');
  return await res.json();
}

// Get user status (online/offline)
export async function getUserStatus(id: string) {
  const res = await fetch(`/api/status/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch user status');
  return await res.json();
}
