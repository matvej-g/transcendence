<?php declare(strict_types=1);

namespace src\app_ws;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

final class AppServer implements MessageComponentInterface
{
    /** @var \SplObjectStorage<ConnectionInterface, array{rooms:array<string,bool>, userId:int|null}> */
    private \SplObjectStorage $clients;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage();
    }

	// stores user connections and their rooms
    public function onOpen(ConnectionInterface $conn): void
    {
        $this->clients->attach($conn, ['rooms' => [], 'userId' => null]);
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        $data = json_decode((string)$msg, true);
        if (!is_array($data) || !isset($data['type'])) {
            $from->send(json_encode(['type' => 'error', 'data' => ['error' => 'invalid_message']], JSON_UNESCAPED_UNICODE));
            return;
        }

        $t = (string)$data['type'];
        $d = is_array($data['data'] ?? null) ? $data['data'] : [];

        $meta = $this->clients[$from];

        // 1) JWT authentication
        if ($t === 'auth') {
            $token = $d['token'] ?? null;
            if (!is_string($token) || $token === '') {
                $from->send(json_encode(['type' => 'auth.error', 'data' => ['error' => 'missing_token']], JSON_UNESCAPED_UNICODE));
                return;
            }

            $payload = verifyJWT($token);
            if ($payload === null) {
                $from->send(json_encode(['type' => 'auth.error', 'data' => ['error' => 'invalid_token']], JSON_UNESCAPED_UNICODE));
                return;
            }

            $uid = (int)($payload['user_id'] ?? 0);
            if ($uid <= 0) {
                $from->send(json_encode(['type' => 'auth.error', 'data' => ['error' => 'invalid_user']], JSON_UNESCAPED_UNICODE));
                return;
            }

            $meta['userId'] = $uid;
            $meta['rooms']["user:$uid"] = true;
            $this->clients[$from] = $meta;

            $from->send(json_encode(
                ['type' => 'auth.ok', 'data' => ['userId' => $uid]],
                JSON_UNESCAPED_UNICODE
            ));
            return;
        }

        if ($t === 'conversation.join') {
            if ($meta['userId'] === null) {
                $from->send(json_encode(['type' => 'conversation.error', 'data' => ['error' => 'not_authenticated']], JSON_UNESCAPED_UNICODE));
                return;
            }
            $cid = (string)($d['conversationId'] ?? '');
            if ($cid === '') {
                $from->send(json_encode(['type' => 'conversation.error', 'data' => ['error' => 'missing_conversation_id']], JSON_UNESCAPED_UNICODE));
                return;
            }

            $meta['rooms']["conversation:$cid"] = true;
            $this->clients[$from] = $meta;
            return;
        }
    }


    public function onClose(ConnectionInterface $conn): void
    {
        if ($this->clients->contains($conn)) {
            $this->clients->detach($conn);
        }
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        $conn->close();
    }

    public function broadcastRoom(string $room, array $event): void
    {
        $out = json_encode($event, JSON_UNESCAPED_UNICODE);

        foreach ($this->clients as $client) {
            $meta = $this->clients[$client];
            if (!empty($meta['rooms'][$room])) {
                $client->send($out);
            }
        }
    }

    public function broadcastUser(int $uid, array $event): void
    {
        $out = json_encode($event, JSON_UNESCAPED_UNICODE);

        foreach ($this->clients as $client) {
            $meta = $this->clients[$client];
            if (($meta['userId'] ?? null) === $uid) {
                $client->send($out);
            }
        }
    }

    public function broadcastUserExceptRoom(int $uid, string $excludeRoom, array $event): void
    {
        $out = json_encode($event, JSON_UNESCAPED_UNICODE);

        foreach ($this->clients as $client) {
            $meta = $this->clients[$client];

            if (($meta['userId'] ?? null) !== $uid) continue;
            if (!empty($meta['rooms'][$excludeRoom])) continue;

            $client->send($out);
        }
    }
}