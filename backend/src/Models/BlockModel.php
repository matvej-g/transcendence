<?php

namespace src\Models;

use src\Database;
use PDO;

class BlockModel
{
    public function __construct(private Database $db) {}

    public function blockUser(int $blockerId, int $blockedId): ?bool
    {
        try {
            $this->db->query(
                'INSERT OR REPLACE INTO blocks (blocker_id, blocked_id) VALUES (?, ?)',
                [$blockerId, $blockedId]
            );
            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function unblockUser(int $blockerId, int $blockedId): ?bool
    {
        try {
            $this->db->query(
                'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
                [$blockerId, $blockedId]
            );
            return true;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function isBlocked(int $blockerId, int $blockedId): ?bool
    {
        try {
            $row = $this->db->query(
                'SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
                [$blockerId, $blockedId]
            )->fetch(PDO::FETCH_ASSOC);
            return $row !== false;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getBlocksForUser(int $userId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM blocks WHERE blocker_id = ? OR blocked_id = ?",
                [$userId, $userId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }
}
