export interface ChangeEmailParams {
  id: UserId | number;
  oldEmail: string;
  newEmail: string;
}

export type UserId = string;

// data that is allowed to be passed to other usersq
export interface UserDataPublic {
  id: UserId;
  username: string;   // shown in UI
}

// What *only the server / this user* sees.
export interface UserDataPrivate {
  // Stuff that should NEVER leak to other users
  email: string;
  firstName: string;
  lastName: string;
  // ...etc.

  // Public profile block embedded here:
  public: UserDataPublic;
}

// Type for a friend request item
export type FriendRequest = {
	friend: {
		id: number;
		username: string;
		email?: string;
		created_at?: string;
		avatar_filename?: string;
		[key: string]: any;
	};
	friendshipId: number;
	receiverId: number;
	senderId: number;
	status: string;
};

// Settings API parameter types
export interface UpdateUserParams {
  id: UserId | number;
  displayName?: string;
  userName?: string;
  email?: string;
  password?: string;
}

export interface ChangePasswordParams {
  id: UserId | number;
  oldPassword: string;
  newPassword: string;
}

declare global {
	interface Window {
		__profileReload?: {
			username?: boolean;
			avatar?: boolean;
			matchHistory?: boolean;
			stats?: boolean;
		} | null;
	}
}
