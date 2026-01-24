import { logger } from '../../utils/logger.js';
import { getCurrentUserId } from '../auth/authUtils.js';

// Check if the current user is friends with the target user
export async function checkIfFriends(targetUserId: number): Promise<boolean> {
	try {
		const currentUserId = getCurrentUserId();
		if (!currentUserId) {
			return false;
		}

		const response = await fetch('/api/friends', {
			method: 'GET',
			headers: {
				'X-USER-ID': String(currentUserId)
			},
			credentials: 'include',
		});

		if (!response.ok) {
			return false;
		}

		const friends = await response.json();
		if (!Array.isArray(friends)) {
			return false;
		}

		// Debug: log friends data to see structure
		logger.log('Friends data:', friends);
		logger.log('Looking for userId:', targetUserId);

		// Check if targetUserId is in the friends list
		// The structure is: { friendshipId, friend: { id, username, ... }, senderId, receiverId, status }
		const found = friends.some((friendship: any) => {
			logger.log('Checking friend:', friendship);
			// Only check accepted friendships
			if (friendship.status !== 'accepted') {
				return false;
			}
			// Check if the friend.id matches, or if the senderId/receiverId matches
			return friendship.friend?.id === targetUserId || 
				friendship.senderId === targetUserId ||
				friendship.receiverId === targetUserId;
		});
		
		logger.log('Friend found:', found);
		return found;
	} catch (error) {
		logger.error('Error checking friendship:', error);
		return false;
	}
}

export async function getPublicProfile(userId: number): Promise<any> {
	try {
		const response = await fetch(`/api/public/profile/${userId}`, {
			method: 'GET',
			credentials: 'include',
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			logger.error('Failed to fetch public profile:', errorData);
			throw new Error(errorData.error || 'Failed to fetch profile');
		}

		const data = await response.json();
		return data;
	} catch (error) {
		logger.error('Error fetching public profile:', error);
		throw error;
	}
}
