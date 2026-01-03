<?php

namespace src\Models;

use src\Database;
use PDO;

class FriendshipModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getFriendshipsForUser(int $userId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM friendships WHERE user_id = ? OR friend_id = ?",
                [$userId, $userId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function sendFriendRequest(int $userId, int $friendId): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, 'pending')",
                [$userId, $friendId]
            );
            return $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function updateStatus(int $id, string $status): ?array
    {
        try {
            $this->db->query(
                "UPDATE friendships SET status = ? WHERE id = ?",
                [$status, $id]
            );
            return $this->getById($id);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getById(int $id): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM friendships WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }
}
