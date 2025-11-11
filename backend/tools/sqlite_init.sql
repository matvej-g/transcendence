CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT NOT NULL UNIQUE,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	two_factor_code TEXT DEFAULT NULL,
	two_factor_expires_at DATETIME DEFAULT NULL,
	two_factor_enabled INTEGER DEFAULT 0,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users(username, email, password_hash)
VALUES ('David Huss', 'dhuss42@heilbron.de', 123);
