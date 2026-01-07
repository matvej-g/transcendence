<?php

namespace src\Models;

use src\Database;
use PDO;

class UserStatusModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getStatusByUserId(int $userId): ?array
    {
        try {
            $row = $this->db->query(
                "SELECT * FROM user_status WHERE user_id = ?",
                [$userId]
            )->fetch(PDO::FETCH_ASSOC);

            return $row ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }

    private function upsertRow(int $userId, int $online, ?int $currentMatchId = null): ?array
    {
        try {
            $this->db->query(
                "INSERT INTO user_status (user_id, online, current_match_id, last_seen)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(user_id) DO UPDATE SET
                   online = excluded.online,
                   current_match_id = excluded.current_match_id,
                   last_seen = excluded.last_seen",
                [$userId, $online, $currentMatchId]
            );

            return $this->getStatusByUserId($userId);
        } catch (\PDOException $e) {
            error_log("Error in upsertRow: " . $e->getMessage());
            return null;
        }
    }

    public function setOnline(int $userId): ?array
    {
        return $this->upsertRow($userId, 1, null);
    }

    public function setOffline(int $userId): ?array
    {
        return $this->upsertRow($userId, 0, null);
    }

    // pass null to reset the status
    public function setCurrentMatch(int $userId, ?int $matchId): ?array
    {
        $online = $matchId !== null ? 1 : 0;
        return $this->upsertRow($userId, $online, $matchId);
    }

    // check if user in Match
    public function isInMatch(int $userId): ?bool
    {
        try {
            $row = $this->db->query(
                "SELECT current_match_id FROM user_status WHERE user_id = ?",
                [$userId]
            )->fetch(PDO::FETCH_ASSOC);

            // Prüfe ob Row existiert UND current_match_id einen Wert hat
            if ($row === false) {
                return false; // User hat keinen Status-Eintrag
            }
            
            // Prüfe ob current_match_id gesetzt ist (nicht NULL und nicht leer)
            return !empty($row['current_match_id']);
        } catch (\PDOException $e) {
            return null;
        }
    }
}
