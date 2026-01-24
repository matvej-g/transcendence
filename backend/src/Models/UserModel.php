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

	public function updateEmail($id, $email) {
		try {
			$this->db->query(
				"UPDATE users SET email = ? WHERE id = ?",
				[$email, $id]
			);
			// file_put_contents(BASE_PATH .'/tmp/debug.log', print_r('user id: '. $id . '\n', true), FILE_APPEND);
			return $this->getUserById($id);
		}
		catch (\PDOException $e) {
        	return null;
		}
	}

    public function updateUserName($id, $userName, $displayName) {
		try {
            $this->db->query(
                "UPDATE users SET username = ?, displayname = ?WHERE id = ?",
                [$userName, $displayName, $id]
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

	// 2FA functions (added for JWT + 2FA authentication) (mert)
	public function saveTwoFactorCode($userId, $code, $expiresAt)
	{
		try {
			return $this->db->query(
				"UPDATE users 
				SET two_factor_code = ?, 
					two_factor_expires_at = ? 
				WHERE id = ?",
				[$code, $expiresAt, $userId]
			);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function verifyTwoFactorCode($userId, $code)
	{
		try {
			$user = $this->db->query(
				"SELECT two_factor_code, two_factor_expires_at 
				FROM users 
				WHERE id = ?",
				[$userId]
			)->fetch(PDO::FETCH_ASSOC);

			// Check if code matches and hasn't expired
			if ($user && $user['two_factor_code'] === $code) {
				$now = date('Y-m-d H:i:s');
				if ($user['two_factor_expires_at'] > $now) {
					// Clear the 2FA code after successful verification to prevent reuse
					$this->db->query(
						"UPDATE users 
						SET two_factor_code = NULL, 
							two_factor_expires_at = NULL 
						WHERE id = ?",
						[$userId]
					);
					return true;
				}
			}

			return false;
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function enable2FA($userId)
	{
		try {
			return $this->db->query(
				"UPDATE users SET two_factor_enabled = 1 WHERE id = ?",
				[$userId]
			);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function disable2FA($userId)
	{
		try {
			return $this->db->query(
				"UPDATE users SET two_factor_enabled = 0 WHERE id = ?",
				[$userId]
			);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function is2FAEnabled($userId)
	{
		try {
			$user = $this->db->query(
				"SELECT two_factor_enabled FROM users WHERE id = ?",
				[$userId]
			)->fetch(PDO::FETCH_ASSOC);
			
			return $user ? (bool)$user['two_factor_enabled'] : false;
		}
		catch (\PDOException $e) {
			return false;
		}
	}

	// OAuth Methods (mert)
	public function getUserByGoogleId($googleId) {
		try {
			return $this->db->query(
				"SELECT * FROM users WHERE oauth_id = ?",
				[$googleId]
			)->fetch(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function createGoogleUser($userName, $displayName, $email, $googleId): ?array {
		try {
			// Insert Google OAuth user
			$this->db->query(
				"INSERT INTO users (username, displayname, email, oauth_id, password_hash) 
				VALUES (?, ?, ?, ?, NULL)", 
				[$userName, $displayName, $email, $googleId]
			);
			
			$userId = $this->db->connection->lastInsertId();

			return $this->getUserById($userId);
		}
		catch (\PDOException $e) {
			error_log("Error creating Google user: " . $e->getMessage());
			return null;
		}
	}
}