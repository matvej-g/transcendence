<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class GameServer implements MessageComponentInterface {
    protected $players;

    public function __construct() {
        $this->players = new \SplObjectStorage;
        echo "GameServer initialized\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $player = new Player($conn);
        $this->players[$conn] = $player;
        echo "New connection: {$conn->resourceId}\n";

        $player->send([
            'type' => 'connected',
            'data' => [
                'playerID' => $player->userID,
                'message' => 'Successfully connected!'
            ]
            ]);
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $player = $this->players[$from];
        $data = json_decode($msg, true);
        echo "Message from {$player->userID}: {$msg}\n";

        $player->send([
            'type' => 'echo',
            'data' => $data
        ]);
    }

    public function onClose(ConnectionInterface $conn) {
        $player = $this->players[$conn];
        echo "Connection closed: {$player->userID}\n";
        unset($this->players[$conn]);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}