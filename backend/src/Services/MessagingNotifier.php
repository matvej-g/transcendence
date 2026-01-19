<?php declare(strict_types=1);

namespace src\Services;

use src\app_ws\RedisPublisher;

final class MessagingNotifier
{
    public function __construct(
        private RedisPublisher $publisher,
    ) {}

	public function messageCreated(
		int $conversationId,
		array $apiMessage,
		array $recipientUserIds,
		int $actorUserId,
	): void {
		$this->publisher->publish('message.created', [
			'conversationId'    => $conversationId,
			'message'           => $apiMessage,
			'recipientUserIds'  => $recipientUserIds,
			'actorUserId'       => $actorUserId,
		]);
	}

	public function messageEdited(
		int $conversationId,
		array $apiMessage,
		array $recipientUserIds,
		int $actorUserId,
	): void {
		$this->publisher->publish('message.edited', [
			'conversationId'    => $conversationId,
			'message'           => $apiMessage,
			'recipientUserIds'  => $recipientUserIds,
			'actorUserId'       => $actorUserId,
		]);
	}

	public function friendRequestCreated(
		int $friendshipId,
		int $fromUserId,
		int $toUserId,
	): void {
		$this->publisher->publish('friend.request.created', [
			'id'        => $friendshipId,
			'fromUserId'=> $fromUserId,     // $userId
			'toUserId'  => $toUserId,       // $friendId
			'recipientUserIds' => [$toUserId],
			'status'    => 'pending',
		]);
	}

	public function friendRequestAccepted(
		int $friendshipId,
		int $fromUserId,
		int $toUserId,
	): void {
		$this->publisher->publish('friend.request.accepted', [
			'id'        => $friendshipId,
			'fromUserId'=> $fromUserId,   // actor (who triggered accept)
			'toUserId'  => $toUserId,     // the other user
			'recipientUserIds' => [$toUserId, $fromUserId],
			'status'    => 'accepted',
		]);
	}

	public function friendRequestRejected(
		int $friendshipId,
		int $fromUserId,
		int $toUserId,
	): void {
		$this->publisher->publish('friend.request.rejected', [
			'id'        => $friendshipId,
			'fromUserId'=> $fromUserId,   // actor (who triggered reject)
			'toUserId'  => $toUserId,     // the other user
			'recipientUserIds' => [$toUserId, $fromUserId],
			'status'    => 'rejected',
		]);
	}
}