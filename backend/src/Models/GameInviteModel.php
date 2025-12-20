<?php

namespace src\Models;

use src\Database;
use PDO;

class GameInviteModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function createInvite(int $senderId, int $receiverId, ?int $conversationId = null, ?int $matchId = null): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO game_invites (conversation_id, sender_id, receiver_id, match_id, status)
                 VALUES (?, ?, ?, ?, 'pending')",
                [$conversationId, $senderId, $receiverId, $matchId]
            );
            return (int) $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getInviteById(int $id): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM game_invites WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function updateStatus(int $id, string $status, ?int $matchId = null): ?array
    {
        try {
            $this->db->query(
                "UPDATE game_invites SET status = ?, match_id = COALESCE(?, match_id) WHERE id = ?",
                [$status, $matchId, $id]
            );
            return $this->getInviteById($id);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getInvitesForUser(int $userId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM game_invites WHERE receiver_id = ? ORDER BY created_at DESC",
                [$userId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }
}
