<?php

namespace src\Models;

use src\Database;
use PDO;

class UserStatsModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getStatsForUser(int $userId): ?array
    {
        try {
            $row = $this->db->query(
                "SELECT * FROM user_stats WHERE user_id = ?",
                [$userId]
            )->fetch(PDO::FETCH_ASSOC);

            return $row ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }

    private function ensureRow(int $userId): void
    {
        try {
            $this->db->query(
                "INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)",
                [$userId]
            );
        } catch (\PDOException $e) {
        }
    }

    public function recordMatchResult(int $winnerId, int $loserId, int $goalsWinner, int $goalsLoser): ?bool
    {
        try {
            $this->ensureRow($winnerId);
            $this->ensureRow($loserId);

            // winner
            $this->db->query(
                "UPDATE user_stats
                 SET wins = wins + 1,
                     games_played = games_played + 1,
                     goals_scored = goals_scored + ?,
                     goals_conceded = goals_conceded + ?,
                     last_game_at = CURRENT_TIMESTAMP
                 WHERE user_id = ?",
                [$goalsWinner, $goalsLoser, $winnerId]
            );

            // loser
            $this->db->query(
                "UPDATE user_stats
                 SET losses = losses + 1,
                     games_played = games_played + 1,
                     goals_scored = goals_scored + ?,
                     goals_conceded = goals_conceded + ?,
                     last_game_at = CURRENT_TIMESTAMP
                 WHERE user_id = ?",
                [$goalsLoser, $goalsWinner, $loserId]
            );

            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function recordTournamentParticipation(array $participantIds): ?bool
    {
        try {
            foreach ($participantIds as $uid) {
                $userId = (int) $uid;
                $this->ensureRow($userId);
                $this->db->query(
                    "UPDATE user_stats SET tournaments_played = tournaments_played + 1 WHERE user_id = ?",
                    [$userId]
                );
            }
            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function recordTournamentWin(int $winnerId): ?bool
    {
        try {
            $this->ensureRow($winnerId);
            $this->db->query(
                "UPDATE user_stats SET tournaments_won = tournaments_won + 1 WHERE user_id = ?",
                [$winnerId]
            );
            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function recordTournamentResult(array $participantIds, ?int $winnerId): ?bool
    {
        $ok = $this->recordTournamentParticipation($participantIds);
        if ($ok === null) {
            return null;
        }
        if ($winnerId !== null) {
            $ok = $this->recordTournamentWin($winnerId);
            if ($ok === null) {
                return null;
            }
        }
        return true;
    }
}
