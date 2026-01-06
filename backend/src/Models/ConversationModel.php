<?php

namespace src\Models;

use src\Database;
use PDO;

class ConversationModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getConversationById(int $id): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM conversations WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
			error_log("[db] getConversationById PDOException: " . $e->getMessage());
            return null;
        }
    }

    public function getConversationsForUser(int $userId): ?array
    {
        try {
            return $this->db->query(
                "SELECT c.*
                 FROM conversations c
                 JOIN conversation_participants cp ON cp.conversation_id = c.id
                 WHERE cp.user_id = ?",
                [$userId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
			error_log("[db] getConversationsForUser PDOException: " . $e->getMessage());
            return null;
        }
    }

    public function createConversation(?string $title = null): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO conversations (title) VALUES (?)",
                [$title]
            );
            return $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
			error_log("[db] createConversation PDOException: " . $e->getMessage());
            return null;
        }
    }

    public function addParticipant(int $conversationId, int $userId): ?int
    {
        try {
            $this->db->query(
                "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)",
                [$conversationId, $userId]
            );
            return $this->db->connection->lastInsertId();
        } catch (\PDOException $e) {
			error_log("[db] addParticipant PDOException: " . $e->getMessage());
            return null;
        }
    }

    public function getParticipants(int $conversationId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM conversation_participants WHERE conversation_id = ?",
                [$conversationId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
			error_log("[db] getParticipants PDOException: " . $e->getMessage());
            return null;
        }
    }
}
