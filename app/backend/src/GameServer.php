<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class GameServer implements MessageComponentInterface {
    protected $players;
    private array $waitingPlayers = [];
    private array $games = [];

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

                $gameID = uniqid('game_');
                $player->gameID = $gameID;
                $player->paddle = 'left';

                $opponent->gameID = $gameID;
                $opponent->paddle = 'right';

                echo "GameID created: { $gameID }, playergameID: { $player->gameID }, oppennent gameID { $opponent->gameID }.\n";

                $player->send([
                    'type' => 'matchFound',
                    'data' => [
                        'message' => 'Match found! Starting game.',
                        'paddle' => 'left',
                        'gameID' => $gameID
                    ]
                ]);
                $opponent->send([
                    'type' => 'matchFound',
                    'data' => [
                        'message' => 'Match found! Starting game.',
                        'paddle' => 'right',
                        'gameID' => $gameID    
                    ]
                ]);

                $this->games[$gameID] = [
                    'player1' => $player,
                    'player2' => $opponent,
                    'started' => time()
                ];
                //TODO: create game and start
            } else {
                //no opponent found yet
                $this->waitingPlayers[] = $player;
                echo "Player {$player->userID} added to waiting queue.\n";
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        if (!isset($this->players[$conn])) return;

        $player = $this->players[$conn];
        echo "Connection closed: {$player->userID}\n";
        
        //remove player from waiting list
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => $p->userID !== $player->userID
        );

        //send player message that opponent disconnected/left
        if ($player->gameID && isset($this->games[$player->gameID])) {
            $gameID = $player->gameID;
            $game = $this->games[$gameID];

            //find opponent
            $opponent = null;
            if ($game['player1']->userID === $player->userID) {
                $opponent = $game['player2'];
            } elseif ($game['player2']->userID === $player->userID) {
                $opponent = $game['player1'];
            }

            if ($opponent && isset($this->players[$opponent->conn])) {
                $opponent->send([
                    'type' => 'opponentDisconnected',
                    'data' => [
                        'message' => 'Opponend disconnected. You win!',
                        'winner' => $opponent->paddle
                    ]
                ]);
                $opponent->gameID = null;
                $opponent->paddle = null;
            }
            unset($this->games[$gameID]);
        }
        unset($this->players[$conn]);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}