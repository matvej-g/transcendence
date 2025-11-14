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
}