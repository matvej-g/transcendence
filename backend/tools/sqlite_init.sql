-- User Data
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users(username, email, password_hash)
VALUES ('David Huss', 'dhuss42@heilbron.de', 123);

-- Pong match Data
CREATE TABLE IF NOT EXISTS matches {
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	player_one_id INTEGER NOT NULL REFERENCES users(id),
	player_two_id INTEGER NOT NULL REFERENCES users(id),
	score_player_one INTEGER DEFAULT 0,
	score_player_two INTEGER DEFAULT 0,
	winner_id INTEGER REFERENCES users(id),
	started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	finished_at DATETIME
};

-- Tournament Data
CREATE TABLE IF NOT EXISTS tournaments {
	id INTEGER PRIMARY KEY,
	tournament_name TEXT NOT NULL,
	started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	finished_at DATETIME
};

CREATE TABLE IF NOT EXISTS tournament_players {
	id INTEGER PRIMARY KEY,
	tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
	user_id INTEGER NOT NULL users(id)
};

CREATE TABLE IF NOT EXISTS tournament_matches {
	id INTEGER PRIMARY KEY,
	tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
	match_id INTEGER NOT NULL REFERENCES matches(id)
};

