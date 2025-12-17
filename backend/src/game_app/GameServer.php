<?php
namespace Pong;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use src\Database;
use src\Models\UserModel;
use src\Models\MatchesModel;

class GameServer implements MessageComponentInterface {
    protected $players;
    private array $waitingPlayers = [];
    private array $games = [];
    private $loop;

    //Database and Models
    private Database $db;
    private UserModel $userModel; //function calls for the database
    private MatchesModel $matchesModel;

    public function __construct($loop = null) {
        $this->players = new \SplObjectStorage;
        $this->loop = $loop;

        $this->db = new Database('sqlite:/var/www/backend/tools/database.sqlite');
        $this->userModel = new UserModel($this->db);
        $this->matchesModel = new MatchesModel($this->db);

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
                'playerID' => $player->sessionID,
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
            $gameMode = $data['data']['gameMode'] ?? 'remote';

            if ($gameMode === 'local') {
                $this->startLocalGame($player);
            } elseif ($gameMode === 'remote') {
                $this->startRemoteGame($player);
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
            //check which paddle to control for local mode
            if ($game['mode'] === 'local') {
                $paddle = $data['data']['paddle'] ?? null;
                if (!$paddle) {
                    return;
                }
            } else {
                $paddle = $player->paddle;
            }
            //set movement direction for paddle when buttom pressed / released
            if ($action === 'keydown') {
                $direction = $data['data']['direction'] ?? null;
                if ($direction === 'up') {
                    $engine->setPaddleVelocity($paddle, -1);
                } elseif ($direction === 'down') {
                    $engine->setPaddleVelocity($paddle, 1);
                }
            } elseif ($action === 'keyup') {
                $engine->setPaddleVelocity($paddle, 0);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        if (!isset($this->players[$conn])) return;

        $player = $this->players[$conn];
        echo "Connection closed: {$player->sessionID}\n";
        
        //remove player from waiting list
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => $p->sessionID !== $player->sessionID
        );

        //send player message that opponent disconnected/left
        if ($player->gameID && isset($this->games[$player->gameID])) {
            $gameID = $player->gameID;
            $game = $this->games[$gameID];

            //find opponent
            $opponent = null;
            if ($game['player1']->sessionID === $player->sessionID) {
                $opponent = $game['player2'];
            } elseif ($game['player2']->sessionID === $player->sessionID) {
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
    
    private function startRemoteGame(Player $player): void {
        if (!$player->isReady()) {
            $player->send([
                'type' => 'error',
                'data' => ['message' => 'Player not authenticated!']
            ]);
            return;
        }

        echo "Player {$player->userID} searching for match...\n";
        if (count($this->waitingPlayers) > 0) {
            $opponent = array_shift($this->waitingPlayers);
            echo "Match found! {$player->sessionID} vs {$opponent->sessionID}\n";

            if (!$opponent->isReady()) {
                $this->waitingPlayers[] = $player;
                return;
            }

            $matchDbID = $this->matchesModel->createMatch(
                $player->userID,
                $opponent->userID
            );
            if (!$matchDbID) {
                echo "Error: Failed to create match in database!\n";
                return;
            }

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
                'mode' => 'remote',
                'started' => time(),
                'engine' => $engine,
                'lastLeftScore' => 0,
                'lastRightScore' => 0,
                'matchDbID' => $matchDbID
            ];
        } else {
            //no opponent found yet
            $this->waitingPlayers[] = $player;
            echo "Player {$player->sessionID} added to waiting queue.\n";
        }
    }

    private function startLocalGame(Player $player): void {
        echo "Player {$player->userID} starting local game...\n";
        $gameID = uniqid('local_');
        $player->gameID = $gameID;
        $player->paddle = 'both';

        $player->send([
            'type' => 'matchFound',
            'data' => [
            'message' => 'Local game started!',
            'paddle' => 'both',
            'gameID' => $gameID
            ]
        ]);
        $engine = new GameEngine($gameID);
        $this->games[$gameID] = [
            'player1' => $player,
            'player2' => null,
            'mode' => 'local',
            'started' => time(),
            'engine' => $engine,
            'lastLeftScore' => 0,
            'lastRightScore' => 0
        ];
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

        if ($game['mode'] === 'local') {
            $game['player1']->send($message);
        } else {
            $game['player1']->send($message);
            $game['player2']->send($message);
        }
        //clean up game if someone won
        if ($newState['winner'] !== null) {
            echo "Game {$gameID} finished! Winner: {$newState['winner']}\n";

            //Update DB only when game ends
            if ($game['mode'] === 'remote' && isset($game['matchDbID'])) {
                $winnerId = ($newState['winner'] === 'left') ? $game['player1']->userID : $game['player2']->userID;
                //update score and set the winner userID
                $this->matchesModel->updateScore($game['matchDbID'], $newState['leftPaddle']['score'], $newState['rightPaddle']['score']);
                $this->matchesModel->endMatch($game['matchDbID'], $winnerId);
                echo "Match {$game['matchDbID']} saved: {$newState['leftPaddle']['score']} - {$newState['rightPaddle']['score']}, Winner: {$winnerId}\n";
            }

            $msgGameOver = [
                'type' => 'gameOver',
                'data' => [
                    'winner' => $newState['winner']
                ]
            ];

            if ($game['mode'] === 'local') {
                $game['player1']->send($msgGameOver);
            } else {
                $game['player1']->send($msgGameOver);
                $game['player2']->send($msgGameOver);
            }

            $game['player1']->gameID = null;
            $game['player1']->paddle = null;
            if ($game['player2']) {
                $game['player2']->gameID = null;
                $game['player2']->paddle = null;
            }

            unset($this->games[$gameID]);
        }
    }
}