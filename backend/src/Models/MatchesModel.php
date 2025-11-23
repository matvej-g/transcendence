<?php 

namespace src\Models;

use src\Database;
use PDO;

class MatchesModel {

	public function __construct(
		private Database $db
		)
	{
	}

	public function getMatchById($id) {
		return $this->db->query(
			"SELECT * FROM matches WHERE id = ?",
			[$id])->fetch(PDO::FETCH_ASSOC);
	}

	public function getAllMatches() {
		return $this->db->query(
			"SELECT * FROM matches"
		)->fetchALL(PDO::FETCH_ASSOC);
	}

	public function createMatch($playerOneId, $playerTwoId) {
		try {
			$this->db->query(
				"INSERT INTO matches(player_one_id, player_two_id) VALUES (?, ?)",
				[$playerOneId, $playerTwoId]
			);
		}
		catch (\PDOException $e) {
			return null;	
		}
		return $this->db->connection->lastInsertId();
	}
}