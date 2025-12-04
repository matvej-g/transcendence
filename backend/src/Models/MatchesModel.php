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
		try {
			return $this->db->query(
				"SELECT * FROM matches WHERE id = ?",
				[$id])->fetch(PDO::FETCH_ASSOC);	
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function getAllMatches() {
		try {
			return $this->db->query(
				"SELECT * FROM matches"
			)->fetchALL(PDO::FETCH_ASSOC);
		}
		catch (\PDOException $e) {
			return null;
		}
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

	public function updateScore($matchId, $scorePlayerOne, $ScorePlayerTwo) {
		try {
			$this->db->query(
				"UPDATE matches SET score_player_one = ?, score_player_two = ? WHERE id = ?",
				[$scorePlayerOne, $ScorePlayerTwo, $matchId]
			);
			return $this->getMatchById($matchId);
		}
		catch (\PDOException $e) {
			return null;
		}
	}

	public function endMatch($matchId, $winnerId) {
		try {
			$this->db->query(
    			"UPDATE matches SET winner_id = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?",
				[$winnerId, $matchId]
			);
			return $this->getMatchById($matchId);
		}
		catch (\PDOException $e) {
			return null;
		}	
	}

	public function deleteMatch($matchId) {
		try {
			$statement = $this->db->query(
				"DELETE FROM matches where id = ?",
				[$matchId]
			);
			return $statement->rowCount();
		}
		catch (\PDOException) {
			return null;
		}
	}
}