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

    public function getMatchesForTournament(int $tournamentId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM tournament_matches WHERE tournament_id = ? ORDER BY round ASC, match_index ASC, id ASC",
                [$tournamentId]
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

    public function createTournamentMatchWithRound(int $tournamentId, int $matchId, int $round, int $matchIndex): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO tournament_matches (tournament_id, match_id, round, match_index) VALUES (?, ?, ?, ?)",
                [$tournamentId, $matchId, $round, $matchIndex]
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

    public function getNextUnfinishedMatchForTournament(int $tournamentId): ?array
    {
        try {
            return $this->db->query(
                "SELECT tm.*, m.player_one_id, m.player_two_id, m.score_player_one, m.score_player_two, m.winner_id, m.started_at, m.finished_at
                 FROM tournament_matches tm
                 JOIN matches m ON m.id = tm.match_id
                 WHERE tm.tournament_id = ? AND m.finished_at IS NULL
                 ORDER BY tm.round ASC, tm.match_index ASC, tm.id ASC
                 LIMIT 1",
                [$tournamentId]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }
}
