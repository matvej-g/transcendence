<?php

namespace src\Models;

use src\Database;
use PDO;

class TournamentMatchesModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getTournamentMatchById($id)
    {
        try {
            return $this->db->query(
                "SELECT * FROM tournament_matches WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getAllTournamentMatches()
    {
        try {
            return $this->db->query(
                "SELECT * FROM tournament_matches"
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function createTournamentMatch($tournamentId, $matchId): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO tournament_matches (tournament_id, match_id) VALUES (?, ?)",
                [$tournamentId, $matchId]
            );
            return $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function updateTournamentMatch($id, $tournamentId, $matchId)
    {
        try {
            $this->db->query(
                "UPDATE tournament_matches SET tournament_id = ?, match_id = ? WHERE id = ?",
                [$tournamentId, $matchId, $id]
            );
            return $this->getTournamentMatchById($id);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function deleteTournamentMatch($id)
    {
        try {
            $statement = $this->db->query(
                "DELETE FROM tournament_matches WHERE id = ?",
                [$id]
            );
            return $statement->rowCount();
        } catch (\PDOException $e) {
            return null;
        }
    }
}
