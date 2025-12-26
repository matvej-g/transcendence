
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
	id: number;
	friend: {
		id: number;
		username: string;
		email?: string;
		avatarUrl?: string;
		[key: string]: any;
	};
	status: string;
};
