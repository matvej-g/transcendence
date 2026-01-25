// Block a user
export async function blockUser(blockedId: number, blockerId: number) {
  const res = await fetch('/api/friends/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ blockedId })
    });
      credentials: 'include'
  if (!res.ok) throw new Error('Failed to block user');
  return await res.json();
}
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
  }
  const res = await fetch(`/api/user/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('User not found');
  return await res.json();
}

// Get friends list
export async function getFriends(userId: number) {
  const res = await fetch('/api/friends', {
    method: 'GET',
    });
      credentials: 'include'
  if (!res.ok) throw new Error('Failed to fetch friends');
  return await res.json();
}

// Send friend request
export async function sendFriendRequest(friendId: number, userId: number) {
  const res = await fetch('/api/friends/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friendId })
    });
      credentials: 'include'
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error('Invalid server response');
  }
  if (!res.ok) {
    // Use 'error' or 'message' property from backend response for error messages
    const errorMsg = data?.error || data?.message || 'Failed to send friend request';
    const error = new Error(errorMsg);
    (error as any).code = res.status;
    throw error;
  }
  return data;
}

// Update friend request status (accepting or pending )
export async function updateFriendStatus(friendshipId: string, userId: number, payload: { status: string }) {
  const res = await fetch(`/api/friends/${encodeURIComponent(friendshipId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
    });
      credentials: 'include'
  if (!res.ok) throw new Error('Failed to update friend status');
  return await res.json();
}

// Get user status (online/offline)
export async function getUserStatus(id: string) {
  const res = await fetch(`/api/status/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch user status');
  return await res.json();
}

// Decline a friend request
export async function declineFriendRequest(friendshipId: number, userId: number) {
  const res = await fetch('/api/friends/decline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: friendshipId })
    });
      credentials: 'include'
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error('Invalid server response');
  }
  if (!res.ok) {
    const errorMsg = data?.error || data?.message || 'Failed to decline friend request';
    const error = new Error(errorMsg);
    (error as any).code = res.status;
    throw error;
  }
  return data;
}
