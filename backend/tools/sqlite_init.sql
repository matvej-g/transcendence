-- User Data
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	displayname TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	two_factor_code TEXT DEFAULT NULL,
	two_factor_expires_at DATETIME DEFAULT NULL,
	two_factor_enabled INTEGER DEFAULT 0,
    avatar_filename TEXT NOT NULL DEFAULT 'default.jpg',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pending user registrations (for email verification via 2FA)
CREATE TABLE IF NOT EXISTS pending_registrations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL,
	displayname TEXT NOT NULL,
	email TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	verification_code TEXT NOT NULL,
	expires_at DATETIME NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- remove these users later on because of password hash
INSERT INTO users(username, displayname, email, password_hash)
VALUES ('david', 'David', 'dhuss42@heilbron.de', 123);

INSERT INTO users(username, displayname, email, password_hash)
VALUES ('test', 'TEST', 'test42@test.de', 234);

-- User presence / status
CREATE TABLE IF NOT EXISTS user_status (
	user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	online INTEGER NOT NULL DEFAULT 0,
	last_seen DATETIME,
	current_match_id INTEGER REFERENCES matches(id)
);

-- Pong match Data
CREATE TABLE IF NOT EXISTS matches (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_one_id INTEGER NOT NULL REFERENCES users(id),
	player_two_id INTEGER NOT NULL REFERENCES users(id),
	score_player_one INTEGER DEFAULT 0,
	score_player_two INTEGER DEFAULT 0,
	winner_id INTEGER REFERENCES users(id),
	started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	finished_at DATETIME
);

-- Tournament Data
CREATE TABLE IF NOT EXISTS tournaments (
	id INTEGER PRIMARY KEY,
	tournament_name TEXT NOT NULL,
	started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	finished_at DATETIME,
	winner_id INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournament_players (
	id INTEGER PRIMARY KEY,
	tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
	user_id INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tournament_matches (
	id INTEGER PRIMARY KEY,
	tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
	match_id INTEGER NOT NULL REFERENCES matches(id),
	round INTEGER NOT NULL DEFAULT 1,
	match_index INTEGER NOT NULL DEFAULT 0
);

-- Conversations and messaging
CREATE TABLE IF NOT EXISTS conversations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_participants (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
	author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	text TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	edited_at DATETIME
);

CREATE TABLE IF NOT EXISTS message_read_states (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	read_at DATETIME,
	UNIQUE(message_id, user_id)
);

-- Game invites for live chat
CREATE TABLE IF NOT EXISTS game_invites (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	conversation_id INTEGER REFERENCES conversations(id) ON DELETE SET NULL,
	sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	match_id INTEGER REFERENCES matches(id),
	status TEXT NOT NULL CHECK (status IN ('pending','accepted','declined','expired')),
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	expires_at DATETIME
);

-- Aggregated user stats
CREATE TABLE IF NOT EXISTS user_stats (
	user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
	wins INTEGER NOT NULL DEFAULT 0,
	losses INTEGER NOT NULL DEFAULT 0,
	games_played INTEGER NOT NULL DEFAULT 0,
	goals_scored INTEGER NOT NULL DEFAULT 0,
	goals_conceded INTEGER NOT NULL DEFAULT 0,
	tournaments_played INTEGER NOT NULL DEFAULT 0,
	tournaments_won INTEGER NOT NULL DEFAULT 0,
	last_game_at DATETIME
);

-- Friendships
CREATE TABLE IF NOT EXISTS friendships (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	status TEXT NOT NULL CHECK (status IN ('pending','accepted','blocked')),
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(user_id, friend_id)
);

-- Blocks
CREATE TABLE IF NOT EXISTS blocks (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(blocker_id, blocked_id)
);
