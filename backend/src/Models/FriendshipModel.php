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

    public function getFriendshipBetween(int $userA, int $userB)
    {
        try {
            return $this->db->query(
                "SELECT * FROM friendships 
                WHERE (user_id = :a AND friend_id = :b)
                OR (friend_id = :a AND user_id = :b)",
                ['a' => $userA, 'b' => $userB]
            )->fetch(PDO::FETCH_ASSOC);
        }
        catch (\PDOException $e) {
            return null;
        }
    }

    public function createRelation(int $userA, int $userB, string $status): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, ?)",
                [$userA, $userB, $status]
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

    public function setPendingRequest(int $friendshipId, int $requesterId, int $receiverId): ?array
    {
        try {
            $this->db->query(
                "UPDATE friendships SET user_id = ?, friend_id = ?, status = 'pending' WHERE id = ?",
                [$requesterId, $receiverId, $friendshipId]
            );
            return $this->getById($friendshipId);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function unblockUserFriendships(int $blockerId, int $blockedId): ?bool
    {
        try {
            $this->db->query(
                'DELETE FROM friendships WHERE user_id = ? AND friend_id = ?',
                [$blockerId, $blockedId]
            );
            return true;
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
