<?php

namespace src\Models;

use src\Database;
use PDO;

class TournamentPlayerModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getTournamentPlayerById($id)
    {
        try {
            return $this->db->query(
                "SELECT * FROM tournament_players WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function isTournamentPlayer($tournamentId, $playerId): ?bool
    {
        try {
            $row = $this->db->query(
                "SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?",
                [$tournamentId, $playerId]
            )->fetch(PDO::FETCH_ASSOC);
            return $row !== false;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function countTournamentPlayers($tournamentId): ?int
    {
        try {
            return $count = $this->db->query(
                "SELECT COUNT(user_id) FROM tournament_players WHERE tournament_id = ?",
                [$tournamentId]
            )->fetchColumn();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getAllTournamentPlayers()
    {
        try {
            return $this->db->query(
                "SELECT * FROM tournament_players"
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function createTournamentPlayer($tournamentId, $userId): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)",
                [$tournamentId, $userId]
            );
            return $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function updateTournamentPlayer($id, $tournamentId, $userId)
    {
        try {
            $this->db->query(
                "UPDATE tournament_players SET tournament_id = ?, user_id = ? WHERE id = ?",
                [$tournamentId, $userId, $id]
            );
            return $this->getTournamentPlayerById($id);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function deleteTournamentPlayer($id)
    {
        try {
            $statement = $this->db->query(
                "DELETE FROM tournament_players WHERE id = ?",
                [$id]
            );
            return $statement->rowCount();
        } catch (\PDOException $e) {
            return null;
        }
    }
}
