<?php

namespace src\Models;

use src\Database;
use PDO;

class BlockModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function blockUser(int $blockerId, int $blockedId): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)",
                [$blockerId, $blockedId]
            );
            return (int) $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function unblockUser(int $blockerId, int $blockedId): ?int
    {
        try {
            $stmt = $this->db->query(
                "DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?",
                [$blockerId, $blockedId]
            );
            return $stmt->rowCount();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function isBlocked(int $blockerId, int $blockedId): ?bool
    {
        try {
            $row = $this->db->query(
                "SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?",
                [$blockerId, $blockedId]
            )->fetch(PDO::FETCH_ASSOC);

            if ($row === false || $row === null) {
                return false;
            }

            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getBlocksForUser(int $blockerId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM blocks WHERE blocker_id = ?",
                [$blockerId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }
}
