-- CREATE TABLE users(
-- 	id INTEGER PRIMARY KEY,
-- 	name TEXT NOT NULL,
-- 	username TEXT NOT NULL UNIQUE,
-- 	email TEXT,
-- 	age INTEGER,
-- 	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- ALTER TABLE users ADD COLUMN status TEXT;

-- DROP TABLE users;

-- INSERT INTO users(name, username)
-- VALUES ('David Huss', 'dhuss42');


-- INSERT INTO users(name, username)
-- VALUES ('John Smith', 'Js'), ('Sal Smith', 'ss'), ('Cole Conner', 'cc');


-- UPDATE users SET email = 'newemail@gmail.com' WHERE  id = 1;

-- DELETE FROM users WHERE id = 2;

-- CREATE TABLE post (
-- 	id INTEGER PRIMARY KEY,
-- 	user_id INTEGER REFERENCES users(id),
-- 	title TEXT NOT NULL,
-- 	body TEXT NOT NULL
-- );

-- INSERT INTO post (user_id, title, body)
-- VALUES (4, 'my first post', 'more information about myself');

SELECT * FROM post 
JOIN users ON post.user_id = users.id;