<?php
namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class GameServer implements MessageComponentInterface {
    protected $players;
    private array $waitingPlayers = [];
    private array $games = [];
    private $loop;

    public function __construct($loop = null) {
        $this->players = new \SplObjectStorage;
        $this->loop = $loop;
        echo "GameServer initialized\n";

        //start game loop at ~60 FPS (every 16ms)
        if ($this->loop) {
            $this->loop->addPeriodicTimer(0.016, function() {
                $this->updateAllGames();
            });
            echo "Game loop timer registered\n";
        } else {
            echo "WARNING: No event loop provided!\n";
        }
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
        //echo "Message from {$player->userID}: {$msg}\n";

        //handle join players
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

                $engine = new GameEngine($gameID);
                $this->games[$gameID] = [
                    'player1' => $player,
                    'player2' => $opponent,
                    'started' => time(),
                    'engine' => $engine,
                    'lastLeftScore' => 0,
                    'lastRightScore' => 0
                ];
            } else {
                //no opponent found yet
                $this->waitingPlayers[] = $player;
                echo "Player {$player->userID} added to waiting queue.\n";
            }
        }

        //handle input from players(paddle movement)
        if ($data['type'] === 'input') {
            if (!$player->gameID || !isset($this->games[$player->gameID])) {
                return;
            }
            $game = $this->games[$player->gameID];
            $engine = $game['engine'];
            $action = $data['data']['action'] ?? null;

            if ($action === 'keydown') {
                $direction = $data['data']['direction'] ?? null;
                if ($direction === 'up') {
                    $engine->setPaddleVelocity($player->paddle, -1);
                } elseif ($direction === 'down') {
                    $engine->setPaddleVelocity($player->paddle, 1);
                }
            } elseif ($action === 'keyup') {
                //stop paddle when key is releaser
                $engine->setPaddleVelocity($player->paddle, 0);
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

    private function updateAllGames(): void {
        // if (count($this->games) > 0) {
        //     echo "Tick: " . count($this->games) . " active games\n";
        // }
        foreach ($this->games as $gameID => $game) {
            $this->updateGame($gameID);
        }
    }

    private function updateGame(string $gameID): void {
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];
        $lastLeftScore = $game['lastLeftScore'];
        $lastRightScore = $game['lastRightScore'];
        $newState = $game['engine']->update();
        //message for Paddle and Ball positions
        $message = [
            'type' => 'gameUpdate',
            'data' => [
                'leftPaddleY' => $newState['leftPaddle']['y'],
                'rightPaddleY' => $newState['rightPaddle']['y'],
                'ballX' => $newState['ball']['x'],
                'ballY' => $newState['ball']['y'],
            ]
        ];

        //message for score change
        if ($newState['leftPaddle']['score'] != $game['lastLeftScore'] ||
            $newState['rightPaddle']['score'] != $game['lastRightScore']) {
                $message['data']['leftScore'] = $newState['leftPaddle']['score'];
                $message['data']['rightScore'] = $newState['rightPaddle']['score'];

                $this->games[$gameID]['lastLeftScore'] = $newState['leftPaddle']['score'];
                $this->games[$gameID]['lastRightScore'] = $newState['rightPaddle']['score'];
            }


        $game['player1']->send($message);
        $game['player2']->send($message);
        //clean up game if someone won
        if ($newState['winner'] !== null) {
            echo "Game {$gameID} finished! Winner: {$newState['winner']}\n";
            $msgGameOver = [
                'type' => 'gameOver',
                'data' => [
                    'winner' => $newState['winner']
                ]
            ];
            $game['player1']->send($msgGameOver);
            $game['player2']->send($msgGameOver);
            $game['player1']->gameID = null;
            $game['player1']->paddle = null;
            $game['player2']->gameID = null;
            $game['player2']->paddle = null;

            unset($this->games[$gameID]);
        }
    }
}