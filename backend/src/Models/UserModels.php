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

	public function createUser($userName, $email, $password_hash) {
		$this->db->query(
				"INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", 
				[$userName, $email, $password_hash]
		);
	}
		
	public function findUserById($id) {
		return $this->db->query(
			"SELECT * FROM users WHERE id = ?",
			[$id])->fetch(PDO::FETCH_ASSOC);
	}

	public function showAllUsers() {
		return $this->db->query(
			"SELECT * FROM users"
		)->fetchAll(PDO::FETCH_ASSOC);
	}
}