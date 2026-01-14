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
}