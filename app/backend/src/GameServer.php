<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class GameServer implements MessageComponentInterface {
    protected $players;
    private array $waitingPlayers = [];

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

        if ($data['type'] === 'join') {
            echo "Player {$player->userID} searching for match...\n";
            if (count($this->waitingPlayers) > 0) {
                $opponent = array_shift($this->waitingPlayers);
                echo "Match found! {$player->userID} vs {$opponent->userID}\n";

                $player->send([
                    'type' => 'matchFound',
                    'data' => ['message' => 'Match found! Starting game.']
                ]);
                $opponent->send([
                    'type' => 'matchFound',
                    'data' => ['message' => 'Match found! Starting game.']
                ]);
                //TODO: create game and start
            } else {
                //no opponent found yet
                $this->waitingPlayers[] = $player;
                echo "Player {$player->usedID} added to waiting queue.\n";
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $player = $this->players[$conn];
        echo "Connection closed: {$player->userID}\n";
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => $p->userID !== $player->userID
        );
        unset($this->players[$conn]);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}