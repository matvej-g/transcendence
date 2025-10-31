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

	// not working
	public function existsInDb($parameter, $value): bool
	{
		$allowed = ['username', 'email'];
		dump('test');
		if (!in_array($parameter, $allowed))
			return false;
		dump('test2');

		$statement = $this->db->query(
			"SELECT * FROM users WHERE $parameter = ?",
			[$parameter, $value])->fetch(PDO::FETCH_ASSOC);
		$statement->execute([$value]);

		$item = $statement->fetchColumn();
		dump($item);
		return true;
	}

	public function createUser($userName, $email, $password_hash) {
		

		// add checks for unique data otherwise an error will be thrown
		return $this->db->query(
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