<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\Models\FriendshipModel;
use src\Models\UserModel;
use src\Validator;

class FriendshipController extends BaseController
{
    private FriendshipModel $friendships;
    private UserModel $users;

    public function __construct(Database $db)
    {
        $this->friendships = new FriendshipModel($db);
        $this->users       = new UserModel($db);
    }

    // Mirrors MessagingController; replace with real auth later.
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

    public function getFriends(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $rows = $this->friendships->getFriendshipsForUser($userId);
        if ($rows === null) {
            return $this->jsonServerError();
        }

        $result = [];
        foreach ($rows as $row) {
            $friendId = (int) $row['user_id'] === $userId
                ? (int) $row['friend_id']
                : (int) $row['user_id'];

            $friend = $this->users->getUserById($friendId);
            if ($friend === null) {
                return $this->jsonServerError();
            }
            if (!$friend) {
                // orphaned friendship row, skip
                continue;
            }

            $result[] = [
                'id'     => (int) $row['id'],
                'friend' => user_to_public($friend),
                'status' => $row['status'],
            ];
        }

        return $this->jsonSuccess($result);
    }

    public function sendRequest(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $friendIdRaw = $request->postParams['friendId'] ?? null;
        if (!Validator::validateId($friendIdRaw)) {
            return $this->jsonBadRequest('Invalid friend id');
        }
        $friendId = (int) $friendIdRaw;

        if ($friendId === $userId) {
            return $this->jsonBadRequest('Cannot befriend yourself');
        }

        $friend = $this->users->getUserById($friendId);
        if ($friend === null) {
            return $this->jsonServerError();
        }
        if (!$friend) {
            return $this->jsonNotFound('Friend user not found');
        }

        $id = $this->friendships->sendFriendRequest($userId, $friendId);
        if ($id === null) {
            // Could be unique constraint violation
            return $this->jsonConflict('Friend request already exists or invalid');
        }

        return $this->jsonCreated(['id' => (int) $id]);
    }

    public function updateStatus(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid friendship id');
        }
        $id = (int) $id;

        $existing = $this->friendships->getById($id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound('Friendship not found');
        }

        // Ensure current user is part of this friendship
        if ((int) $existing['user_id'] !== $userId && (int) $existing['friend_id'] !== $userId) {
            return $this->jsonUnauthorized('Not a participant of this friendship');
        }

        $status = $request->postParams['status'] ?? null;
        $allowed = ['pending', 'accepted', 'blocked'];
        if (!is_string($status) || !in_array($status, $allowed, true)) {
            return $this->jsonBadRequest('Invalid status');
        }

        $updated = $this->friendships->updateStatus($id, $status);
        if ($updated === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess($updated);
    }
}
