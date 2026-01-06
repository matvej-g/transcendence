<?php

namespace src\Models;

use src\Database;
use PDO;

class UserModel {

	public function __construct(
		private Database $db
	)
	{
	}

	public function getUserById($id) {
		try {
			return $this->db->query(
				"SELECT * FROM users WHERE id = ?",
				[$id])->fetch(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function getAllUsers() {
		try {
			return $this->db->query(
				"SELECT * FROM users"
			)->fetchAll(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function getUserByUsername($userName) {
		try {
			return $this->db->query(
				"SELECT * FROM users WHERE username = ?",
				[$userName])->fetch(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function getUserByEmail($email) {
		try {
			return $this->db->query(
				"SELECT * FROM users WHERE email = ?",
				[$email])->fetch(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function getUserByUsernameOrEmail($usernameOrEmail) {
		try {
			return $this->db->query(
				"SELECT * FROM users WHERE username = ? OR email = ?",
				[$usernameOrEmail])->fetch(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function createUser($userName, $displayName, $email, $password_hash): ?int {
		try {
			$this->db->query(
					"INSERT INTO users (username, displayname, email, password_hash) VALUES (?, ?, ?, ?)", 
					[$userName, $displayName, $email, $password_hash]
			);
			return $this->db->connection->lastInsertId();
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	// another approach could be to create an is deleted flag
	// delete could update that flag
	// would save cascade that is involved through relational data where user is used
	public function deleteUser($id) {
		try {
			$statement = $this->db->query(
				"DELETE FROM users WHERE id = ?",
				[$id]);
			return $statement->rowCount();
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function updatePassword($id, $password) {
		try {
			$this->db->query(
				"UPDATE users SET password_hash = ? WHERE id = ?",
				[$password, $id]
			);
			return $this->getUserById($id);
		}
		catch (\PDOException $e) {
        	return null;
		}
	}

    public function updateUserInfo($id, $userName, $displayName, $email, $password) {
        try {
            $this->db->query(
                "UPDATE users SET username = ?, displayname = ?, email = ?, password_hash = ? WHERE id = ?",
                [$userName, $displayName, $email, $password, $id]
            );
            return $this->getUserById($id);
        }
        catch (\PDOException $e) {
            return null;
        }
    }

    public function updateAvatarFilename(int $id, string $filename): ?array {
        try {
            $this->db->query(
                "UPDATE users SET avatar_filename = ? WHERE id = ?",
                [$filename, $id]
            );
            return $this->getUserById($id);
        }
        catch (\PDOException $e) {
            return null;
        }
    }
}
