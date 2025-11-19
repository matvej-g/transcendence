<?php 

namespace src\Models;

use src\Database;
use PDO;

class TournamentsModel {
	public function __construct(
		private Database $db
	) {
	}

	public function getTournamentById($id) {
		return $this->db->query(
			"SELECT * FROM tournaments WHERE id = ?",
			[$id])->fetch(PDO::FETCH_ASSOC);
	}

	public function getAllTournaments() {
		return $this->db->query(
			"SELECT * FROM tournaments"
		)->fetchALL(PDO::FETCH_ASSOC);
	}

	public function createTournament($name): ?int {
		try {
			$this->db->query(
				"INSERT INTO tournaments(tournament_name) VALUES (?)",
				[$name]
			);
			return $this->db->connection->lastInsertId();
		}
		catch (\PDOException $e) {
			return null;
		}
	}
}