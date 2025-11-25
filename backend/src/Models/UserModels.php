<?php

namespace src\Models;

use src\Database;
use PDO;

// handles query logic for Users
class UserModels {

	public function __construct(
		private Database $db
	)
	{
	}


	public function getUserByUsernameOrEmail($usernameOrEmail) {
		return $this->db->query(
			"SELECT * FROM users WHERE username = ? OR email = ?",
			[$usernameOrEmail])->fetch(PDO::FETCH_ASSOC);
	}

	// adds a new user
	// catches error for unique fields etc.
	public function createUser($userName, $email, $password_hash): ?int {
		
		try {
			$this->db->query(
					"INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", 
					[$userName, $email, $password_hash]
			);
			return $this->db->connection->lastInsertId();
		}
		catch (\PDOException $e) {
			return null;
		}
	}
		
	public function getUserById($id) {
		return $this->db->query(
			"SELECT * FROM users WHERE id = ?",
			[$id])->fetch(PDO::FETCH_ASSOC);
	}

	public function getAllUsers() {
		return $this->db->query(
			"SELECT * FROM users"
		)->fetchAll(PDO::FETCH_ASSOC);
	}

	public function saveTwoFactorCode($userId, $code, $expiresAt)
	{
		return $this->db->query(
			"UPDATE users 
			SET two_factor_code = ?, 
				two_factor_expires_at = ? 
			WHERE id = ?",
			[$code, $expiresAt, $userId]
		);
	}

	public function verifyTwoFactorCode($userId, $code)
	{
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
				return true;
			}
		}

		return false;
	}
}