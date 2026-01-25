<?php declare(strict_types=1);

namespace src\app_ws;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

final class AppServer implements MessageComponentInterface
{
    /** @var \SplObjectStorage<ConnectionInterface, array{rooms:array<string,bool>}> */
    private \SplObjectStorage $clients;
	private array $userConn = [];

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
        if (!is_array($data) || !isset($data['type'])) return;

        $t = (string)$data['type'];
        $d = is_array($data['data'] ?? null) ? $data['data'] : [];

        $meta = $this->clients[$from];

        // // 1) brittle auth: client tells us which user it is
        // if ($t === 'auth') {
        //     $uid = $d['userId'] ?? null;
        //     if (!is_int($uid) && !(is_string($uid) && ctype_digit($uid))) return;

        //     $uid = (int)$uid;
        //     if ($uid <= 0) return;

        //     $meta['userId'] = $uid;
        //     $meta['rooms']["user:$uid"] = true;
        //     $this->clients[$from] = $meta;

        //     // optional ack
        //     $from->send(json_encode(['type' => 'auth.ok', 'data' => ['userId' => $uid]], JSON_UNESCAPED_UNICODE));
        //     return;
        // }
        if ($t === 'auth') {
            $uid = $d['userId'] ?? null;
            if (!is_int($uid) && !(is_string($uid) && ctype_digit($uid))) return;
            $uid = (int)$uid;
            if ($uid <= 0) return;

			// Close previous connection for this user (prevents duplicates)
			if (isset($this->userConn[$uid]) && $this->userConn[$uid] !== $from) {
				$old = $this->userConn[$uid];
				$old->close();
				// (onClose will detach it)
			}
			$this->userConn[$uid] = $from;

			$meta = $this->clients[$from];
            $meta['userId'] = $uid;
            $meta['rooms']["user:$uid"] = true;
            $this->clients[$from] = $meta;

            $from->send(json_encode(['type' => 'auth.ok', 'data' => ['userId' => $uid]], JSON_UNESCAPED_UNICODE));
            return;
        }

        // 2) join a conversation room
        if ($t === 'conversation.join') {
            $cid = (string)($d['conversationId'] ?? '');
            if ($cid === '') return;

            $meta['rooms']["conversation:$cid"] = true;
            $this->clients[$from] = $meta;
            return;
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
		if ($this->clients->contains($conn)) {
			$meta = $this->clients[$conn];
			$uid = $meta['userId'] ?? null;
			if (is_int($uid) && isset($this->userConn[$uid]) && $this->userConn[$uid] === $conn) {
				unset($this->userConn[$uid]);
			}
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
}