<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\Models\FriendshipModel;
use src\Models\UserModel;
use src\Models\BlockModel;
use src\Validator;
use src\Services\MessagingNotifier;
use src\app_ws\RedisPublisher;

class FriendshipController extends BaseController
{
    private FriendshipModel $friendships;
    private UserModel $users;
    private BlockModel $blocks;
	private MessagingNotifier $notifier;

    public function __construct(Database $db)
    {
        $this->friendships = new FriendshipModel($db);
        $this->users       = new UserModel($db);
        $this->blocks      = new BlockModel($db);
		$this->notifier = new MessagingNotifier(new RedisPublisher());
    }

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
            if ((int) $row['user_id'] === $userId) {
                $friendId = (int) $row['friend_id'];
            } else {
                $friendId = (int) $row['user_id'];
            }

            $senderId   = (int)$row['user_id'];
            $receiverId = (int)$row['friend_id'];

            $user = $this->users->getUserById($userId);
            if ($user === null) {
                return $this->jsonServerError();
            }
            if (!$user) {
                continue;
            }

            $friend = $this->users->getUserById($friendId);
            if ($friend === null) {
                return $this->jsonServerError();
            }
            if (!$friend) {
                continue;
            }

            $result[] = [
                'friendshipId'     => (int) $row['id'],
                'friend' => user_to_public($friend),
                'senderId' => $senderId,
                'receiverId' => $receiverId,
                'status' => $row['status'],
            ];
        }

        return $this->jsonSuccess($result);
    }

	// note: handles both sending new requests and accepting existing ones
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

        $existing = $this->friendships->getFriendshipBetween($userId, $friendId);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if ($existing) {
            $status = $existing['status'];
            if ($status === 'pending' && $friendId === (int)$existing['user_id'] && $userId === (int)$existing['friend_id']) {
                $accepted = $this->friendships->updateStatus((int)$existing['id'], 'accepted');
                if ($accepted === null) {
                    return $this->jsonServerError();
                }

                // WS notify: request accept
                $this->notifier->friendRequestAccepted(
                    (int)$accepted['id'],
                    $userId,
                    $friendId
                );

                return $this->jsonCreated(['id' => (int)$accepted['id']]);
            } else if ($status === 'pending') {
                return $this->jsonConflict('Your already have a pending request');
            } else if ($status === 'accepted') {
                return $this->jsonConflict('Already Friends');
            } else if ($status === 'blocked') {
                $blockedByMe   = $this->blocks->isBlocked($userId, $friendId);
                $blockedByThem = $this->blocks->isBlocked($friendId, $userId);
                if ($blockedByMe === null || $blockedByThem === null) {
                    return $this->jsonServerError();
                }
                if ($blockedByThem) {
                    return $this->jsonConflict('You are blocked');
                }
                if ($blockedByMe) {
                    $unblocked = $this->blocks->unblockUser($userId, $friendId);
                    if ($unblocked === null) {
                        return $this->jsonServerError();
                    }
                    $pending = $this->friendships->setPendingRequest((int)$existing['id'], $userId, $friendId);
                    if ($pending === null) {
                        return $this->jsonServerError();
                    }

                    // WS notify: request create (when unblocking and sending request)
                    $this->notifier->friendRequestCreated(
                        (int)$pending['id'],
                        $userId,
                        $friendId
                    );

                    return $this->jsonCreated(['id' => (int)$pending['id']]);
                }
            }
        }

        $id = $this->friendships->createRelation($userId, $friendId, 'pending');
        if ($id === null) {
            return $this->jsonServerError();
        }

		 // WS notify: request create (normal new request path)
		$this->notifier->friendRequestCreated(
			(int)$id,
			$userId,
			$friendId
		);

        return $this->jsonCreated(['id' => (int)$id]);
    }

	// damn this should be called updateFriendshipStatus or acceptDeclineRequest
	public function updateStatus(Request $request, $parameters)
    {
        // get current user id
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        // retrieve friendship id
        $idParam = $parameters['id'] ?? null;
        if (!Validator::validateId($idParam)) {
            return $this->jsonBadRequest('Invalid friendship id');
        }
        $id = (int)$idParam;

        // retrieve status of update
        $status = $request->postParams['status'] ?? null;
        $allowed = ['pending', 'accepted'];
        if (!is_string($status) || !in_array($status, $allowed, true)) {
            return $this->jsonBadRequest('Invalid status');
        }

        // retrieve exisiting friendship
        $existing = $this->friendships->getById($id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound('Friendship not found');
        }

        // check if user is part of friendship
        if ((int)$existing['user_id'] !== $userId && (int)$existing['friend_id'] !== $userId) {
            return $this->jsonUnauthorized('Not a participant of this friendship');
        }

        // update status
        $updated = $this->friendships->updateStatus($id, $status);
        if ($updated === null) {
            return $this->jsonServerError();
        }

		// needed to figure out who is the other user
        $u1 = (int)$existing['user_id'];
        $u2 = (int)$existing['friend_id'];
        $otherUserId = ($userId === $u1) ? $u2 : $u1;

		$this->notifier->friendRequestAccepted(
            $id,
            $userId,        // actor (the one who accepted)
            $otherUserId
        );

        return $this->jsonSuccess($updated);
    }

    // the passed user_id needs to be the receiver of the request
    public function declineRequest(Request $request, $parameters)
    {
        // get current user id
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        // retrieve friendship id
        $idParam = $request->postParams['id'] ?? null;
        if (!Validator::validateId($idParam)) {
            return $this->jsonBadRequest('Invalid friendship id');
        }
        $id = (int)$idParam;

        // retrieve exisiting friendship
        $existing = $this->friendships->getById($id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound('Friendship not found');
        }

        // check if user is receiver of initial request
        if ($userId !== (int)$existing['friend_id'] && $userId === (int)$existing['user_id']) {
            return $this->jsonBadRequest('declining user must be receiver of request');
        }

        $deleted = $this->friendships->deleteRequest($id, $userId);
        if ($deleted === null) {
            return $this->jsonServerError();
        } else {
			$this->notifier->friendRequestRejected(
                $id,
                $userId,        // actor (the one who rejected)
                (int)$existing['user_id'] === $userId ? (int)$existing['friend_id'] : (int)$existing['user_id']
            );
            return $this->jsonSuccess('Friend Request declined');
        }
    }

    public function blockUser(Request $request, $parameters)
    {
        // get blocker Id
        $blockerId = $this->getCurrentUserId($request);
        if ($blockerId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        // get blocked Id
        $blockedIdRaw = $request->postParams['blockedId'] ?? null;
        if (!Validator::validateId($blockedIdRaw)) {
            return $this->jsonBadRequest('Invalid blockedId');
        }
        $blockedId = (int)$blockedIdRaw;

        // check if same id
        if ($blockedId === $blockerId) {
            return $this->jsonBadRequest('Cannot block yourself');
        }

        // check if already blocked
        $isBlocked = $this->blocks->isBlocked($blockerId, $blockedId);
        if ($isBlocked) {
            return $this->jsonBadRequest('User already blocked');
        }

        // block user in block table
        $blockedRelation = $this->blocks->blockUser($blockerId, $blockedId);
        if ($blockedRelation === null) {
            return $this->jsonServerError();
        } else {
            // block user in friendships table
            $friendshipRelation = $this->friendships->getFriendshipBetween($blockerId, $blockedId);
            if ($friendshipRelation === false) {
                $this->friendships->createRelation($blockerId, $blockedId, 'blocked');
            } else if ($friendshipRelation === null) {
                return $this->jsonServerError();
            } else {
                $frndsTblBlc = $this->friendships->updateStatus($friendshipRelation['id'], 'blocked');
                if ($frndsTblBlc === null) {
                    return $this->jsonServerError();
                }
            }
            // Notify both users about the block
            $this->notifier->friendBlocked($blockerId, $blockedId);
        }
        return $this->jsonCreated(['id' => (int)$blockedRelation]);
    }

    public function unblockUser(Request $request, $parameters)
    {
        $blockerId = $this->getCurrentUserId($request);
        if ($blockerId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        // get blocked Id
        $blockedIdRaw = $request->postParams['blockedId'] ?? null;
        if (!Validator::validateId($blockedIdRaw)) {
            return $this->jsonBadRequest('Invalid blockedId');
        }
        $blockedId = (int)$blockedIdRaw;

        // check if same id
        if ($blockedId === $blockerId) {
            return $this->jsonBadRequest('Cannot unblock yourself');
        }

        // check if actually blocked
        $isBlocked = $this->blocks->isBlocked($blockerId, $blockedId);
        if (!$isBlocked) {
            return $this->jsonBadRequest('User is not blocked');
        }

        $blockedRelation = $this->blocks->unblockUser($blockerId, $blockedId);
        if ($blockedRelation === null) {
            return $this->jsonServerError();
        } else {
            // unblock user in friendships table
            $friendshipRelation = $this->friendships->getFriendshipBetween($blockerId, $blockedId);
            if ($friendshipRelation === false) {
                return $this->jsonBadRequest('User is not blocked');
            } else if ($friendshipRelation === null) {
                return $this->jsonServerError();
            } else {
                $frndsTblUblc = $this->friendships->unblockUserFriendships($blockerId, $blockedId);
                if ($frndsTblUblc === null) {
                    return $this->jsonServerError();
                }
            }
        }
        return $this->jsonSuccess('User unblocked');
    }

    public function getBlocks(Request $request, $parameters)
    {
        $blockerId = $this->getCurrentUserId($request);
        if ($blockerId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $rows = $this->blocks->getBlocksForUser($blockerId);
        if ($rows === null) {
            return $this->jsonServerError();
        }

        $result = [];
        foreach ($rows as $row) {

            $blocked = $this->users->getUserById($row['blocked_id']);
            if ($blocked === null) {
                return $this->jsonServerError();
            }
            if (!$blocked) {
                continue;
            }

            $blocker = $this->users->getUserById($row['blocker_id']);
            if ($blocker === null) {
                return $this->jsonServerError();
            }
            if (!$blocker) {
                continue;
            }

            $result[] = [
                'id'     => (int) $row['id'],
                'blocker' => user_to_public($blocker),
                'blocked' => user_to_public($blocked),
            ];
        }

        return $this->jsonSuccess($result);
    }
}
