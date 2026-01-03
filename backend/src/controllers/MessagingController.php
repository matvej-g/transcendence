<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\Models\ConversationModel;
use src\Models\MessageModel;
use src\Models\BlockModel;
use src\Models\GameInviteModel;
use src\Models\UserModel;
use src\Validator;

class MessagingController extends BaseController
{
    private ConversationModel $conversations;
    private MessageModel $messages;
    private BlockModel $blocks;
    private GameInviteModel $invites;
    private UserModel $users;

    public function __construct(Database $db)
    {
        $this->conversations = new ConversationModel($db);
        $this->messages      = new MessageModel($db);
        $this->blocks        = new BlockModel($db);
        $this->invites       = new GameInviteModel($db);
        $this->users         = new UserModel($db);
    }

    // Replace this with proper auth/JWT once available.
    private function getCurrentUserId(Request $request): ?int
    {
        $server = $request->server;
        $headerId = $server['HTTP_X_USER_ID'] ?? null;
        if ($headerId !== null && Validator::validateId($headerId)) {
            return (int) $headerId;
        }

        $candidate = $request->postParams['currentUserId']
            ?? $request->getParams['currentUserId']
            ?? null;

        if ($candidate !== null && Validator::validateId($candidate)) {
            return (int) $candidate;
        }

        return null;
    }

    private function mapMessageRowToApi(array $row): ?array
    {
        if (!$row) {
            return null;
        }

        $author = $this->users->getUserById((int) $row['author_id']);
        if ($author === null) {
            return null;
        }
        if (!$author) {
            return null;
        }

        $author = user_to_public($author);

        $createdAt = $row['created_at'] ?? null;
        if ($createdAt !== null) {
            try {
                $dt = new \DateTime($createdAt);
                $createdAt = $dt->format(DATE_ATOM);
            } catch (\Exception) {
            }
        }

        return [
            'id'             => (string) $row['id'],
            'conversationId' => (string) $row['conversation_id'],
            'author'         => $author,
            'text'           => $row['text'],
            'createdAt'      => $createdAt,
        ];
    }

    private function buildConversationSummary(int $conversationId, int $currentUserId): ?array
    {
        $conversation = $this->conversations->getConversationById($conversationId);
        if ($conversation === null || $conversation === []) {
            return null;
        }

        $participantsRows = $this->conversations->getParticipants($conversationId);
        if ($participantsRows === null) {
            return null;
        }

        $participants = [];
        foreach ($participantsRows as $p) {
            $user = $this->users->getUserById((int) $p['user_id']);
            if ($user === null || !$user) {
                continue;
            }
            $participants[] = user_to_public($user);
        }

        // Last message
        $allMessages = $this->messages->getMessagesForConversation($conversationId);
        $lastMessage = null;
        if ($allMessages !== null && count($allMessages) > 0) {
            $lastRow = $allMessages[count($allMessages) - 1];
            $lastMessage = $this->mapMessageRowToApi($lastRow);
        }

        // Unread count
        $unread = $this->messages->getUnreadCountForConversation($conversationId, $currentUserId);
        if ($unread === null) {
            $unread = 0;
        }

        return [
            'id'          => (string) $conversation['id'],
            'title'       => $conversation['title'] ?? '',
            'lastMessage' => $lastMessage,
            'unreadCount' => (int) $unread,
            'participants'=> $participants,
        ];
    }

    public function getConversations(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $rows = $this->conversations->getConversationsForUser($userId);
        if ($rows === null) {
            return $this->jsonServerError();
        }

        $summaries = [];
        foreach ($rows as $row) {
            $summary = $this->buildConversationSummary((int) $row['id'], $userId);
            if ($summary !== null) {
                $summaries[] = $summary;
            }
        }

        return $this->jsonSuccess($summaries);
    }

    public function getConversation(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $conversationId = (int) $id;

        // Ensure user is a participant
        $participants = $this->conversations->getParticipants($conversationId);
        if ($participants === null) {
            return $this->jsonServerError();
        }
        $isParticipant = false;
        foreach ($participants as $p) {
            if ((int) $p['user_id'] === $userId) {
                $isParticipant = true;
                break;
            }
        }
        if (!$isParticipant) {
            return $this->jsonUnauthorized('Not a participant of this conversation');
        }

        $summary = $this->buildConversationSummary($conversationId, $userId);
        if ($summary === null) {
            return $this->jsonNotFound('Conversation not found');
        }

        $rows = $this->messages->getMessagesForConversation($conversationId);
        if ($rows === null) {
            return $this->jsonServerError();
        }

        $messages = [];
        foreach ($rows as $row) {
            $mapped = $this->mapMessageRowToApi($row);
            if ($mapped !== null) {
                $messages[] = $mapped;
            }
        }

        return $this->jsonSuccess([
            'summary'  => $summary,
            'messages' => $messages,
        ]);
    }


    public function createConversation(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $participantIds = $request->postParams['participantIds'] ?? null;
        $messageData    = $request->postParams['message'] ?? null;

        if (!Validator::validateIdArray($participantIds ?? [])) {
            return $this->jsonBadRequest('Invalid participant ids');
        }

        $text = $messageData['text'] ?? null;
        if ($text === null || !Validator::validateMessageText($text)) {
            return $this->jsonBadRequest('Invalid message text');
        }

        // Ensure current user is part of the conversation
        $allParticipantIds = array_map('intval', $participantIds);
        if (!in_array($userId, $allParticipantIds, true)) {
            $allParticipantIds[] = $userId;
        }

        try {
            // 1) Create conversation (title = null)
            $conversationId = $this->conversations->createConversation(null);
            if ($conversationId === null) {
                error_log("[messaging] createConversation: createConversation(null) returned null");
                return $this->jsonServerError('createConversation failed');
            }

            // 2) Add participants
            foreach ($allParticipantIds as $pid) {
                $added = $this->conversations->addParticipant((int)$conversationId, (int)$pid);
                if ($added === null) {
                    error_log("[messaging] createConversation: addParticipant failed. convo={$conversationId} pid={$pid}");
                    return $this->jsonServerError('addParticipant failed');
                }
            }

            // 3) Create first message
            $row = $this->messages->createMessage((int)$conversationId, (int)$userId, (string)$text);
            if ($row === null) {
                error_log("[messaging] createConversation: createMessage failed. convo={$conversationId} user={$userId}");
                return $this->jsonServerError('createMessage failed');
            }

            // 4) Map message
            $apiMessage = $this->mapMessageRowToApi($row);
            if ($apiMessage === null) {
                error_log("[messaging] createConversation: mapMessageRowToApi failed");
                return $this->jsonServerError('mapMessage failed');
            }

            return $this->jsonCreated($apiMessage);

        } catch (\Throwable $e) {
            error_log("[messaging] createConversation exception: " . $e->getMessage());
            return $this->jsonServerError('Database exception');
        }
    }

    public function sendMessage(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $conversationId = (int) $id;

        $text = $request->postParams['text'] ?? null;
        if ($text === null || !Validator::validateMessageText($text)) {
            return $this->jsonBadRequest('Invalid message text');
        }

        // Ensure user is a participant
        $participants = $this->conversations->getParticipants($conversationId);
        if ($participants === null) {
            return $this->jsonServerError();
        }
        $isParticipant = false;
        $otherUserIds = [];
        foreach ($participants as $p) {
            $uid = (int) $p['user_id'];
            if ($uid === $userId) {
                $isParticipant = true;
            } else {
                $otherUserIds[] = $uid;
            }
        }
        if (!$isParticipant) {
            return $this->jsonUnauthorized('Not a participant of this conversation');
        }

        // Basic block check: if any other participant has blocked current user, deny
        foreach ($otherUserIds as $otherId) {
            $blocked = $this->blocks->isBlocked($otherId, $userId);
            if ($blocked === null) {
                return $this->jsonServerError();
            }
            if ($blocked === true) {
                return $this->jsonBadRequest('You are blocked by this user');
            }
        }

        $row = $this->messages->createMessage($conversationId, $userId, $text);
        if ($row === null) {
            return $this->jsonServerError();
        }

        $apiMessage = $this->mapMessageRowToApi($row);
        if ($apiMessage === null) {
            return $this->jsonServerError();
        }

        return $this->jsonCreated($apiMessage);
    }

    public function editMessage(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $messageId = (int) $id;

        $text = $request->postParams['text'] ?? null;
        if ($text === null || !Validator::validateMessageText($text)) {
            return $this->jsonBadRequest('Invalid message text');
        }

        $row = $this->messages->editMessage($messageId, $userId, $text);
        if ($row === null) {
            return $this->jsonServerError();
        }
        if ($row === []) {
            return $this->jsonUnauthorized('Cannot edit this message');
        }

        $apiMessage = $this->mapMessageRowToApi($row);
        if ($apiMessage === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess($apiMessage);
    }
}
