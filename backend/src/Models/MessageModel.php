<?php

namespace src\Models;

use src\Database;
use PDO;

class MessageModel
{
    public function __construct(
        private Database $db
    ) {
    }

    public function getMessagesForConversation(int $conversationId): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, id ASC",
                [$conversationId]
            )->fetchAll(PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getMessagesWithReadStateForConversation(int $conversationId, int $userId): ?array
    {
        try {
            $rows = $this->db->query(
                "SELECT m.*, rs.read_at
                 FROM messages m
                 LEFT JOIN message_read_states rs
                   ON rs.message_id = m.id AND rs.user_id = ?
                 WHERE m.conversation_id = ?
                 ORDER BY m.created_at ASC, m.id ASC",
                [$userId, $conversationId]
            )->fetchAll(\PDO::FETCH_ASSOC);

            if ($rows === false || $rows === null) {
                return [];
            }

            // Auto-mark unread as read for this user
            foreach ($rows as &$row) {
                if ($row['read_at'] === null) {
                    $this->markMessageRead((int)$row['id'], $userId);
                    // Set read_at to “now” in the in-memory row so we don’t have to requery
                    $row['read_at'] = date('Y-m-d H:i:s');
                }
            }

            return $rows;
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function createMessage(int $conversationId, int $authorId, string $type, string $text): ?array
    {
        try {
            $this->db->query(
                "INSERT INTO messages (conversation_id, author_id, type, text) VALUES (?, ?, ?, ?)",
                [$conversationId, $authorId, $type, $text]
            );
            $id = (int) $this->db->connection->lastInsertId();

            return $this->getMessageById($id);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getMessageById(int $id): ?array
    {
        try {
            return $this->db->query(
                "SELECT * FROM messages WHERE id = ?",
                [$id]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function editMessage(int $messageId, int $authorId, string $newText): ?array
    {
        try {
            // Ensure only the author can edit their own message
            $existing = $this->getMessageById($messageId);
            if ($existing === null || $existing === [] || (int) $existing['author_id'] !== $authorId) {
                return [];
            }

            $this->db->query(
                "UPDATE messages SET text = ?, edited_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$newText, $messageId]
            );

            return $this->getMessageById($messageId);
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function markMessageRead(int $messageId, int $userId): ?array
    {
        try {
            $this->db->query(
                "INSERT INTO message_read_states (message_id, user_id, read_at)
                 VALUES (?, ?, CURRENT_TIMESTAMP)
                 ON CONFLICT(message_id, user_id) DO UPDATE SET read_at = excluded.read_at",
                [$messageId, $userId]
            );

            return $this->db->query(
                "SELECT * FROM message_read_states WHERE message_id = ? AND user_id = ?",
                [$messageId, $userId]
            )->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (\PDOException $e) {
            return null;
        }
    }

    public function getUnreadCountForConversation(int $conversationId, int $userId): ?int
    {
        try {
            $row = $this->db->query(
                "SELECT COUNT(m.id) AS unread
                 FROM messages m
                 LEFT JOIN message_read_states rs
                   ON rs.message_id = m.id AND rs.user_id = ?
                 WHERE m.conversation_id = ?
                   AND rs.read_at IS NULL",
                [$userId, $conversationId]
            )->fetch(PDO::FETCH_ASSOC);

            if ($row === false || $row === null) {
                return 0;
            }

            return (int) ($row['unread'] ?? 0);
        } catch (\PDOException $e) {
            return null;
        }
    }
}
