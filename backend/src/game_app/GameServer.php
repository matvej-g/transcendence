<?php
namespace Pong;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
//Database Models
use src\Database;
use src\Models\UserModel;
use src\Models\MatchesModel;
use src\Models\UserStatsModel;
use src\Models\UserStatusModel;

class GameServer implements MessageComponentInterface {
    protected $players;
    private array $waitingPlayers = [];
    private array $games = [];
    private $loop;

    private Database $db;
    private UserModel $userModel;
    private MatchesModel $matchesModel;
    private UserStatsModel $userStatsModel;
    private UserStatusModel $userStatus;

    public function __construct($loop = null) {
        $this->players = new \SplObjectStorage;
        $this->loop = $loop;

        $this->db = new Database('sqlite:/var/www/html/database/transcendence.db');
        $this->userModel = new UserModel($this->db);
        $this->matchesModel = new MatchesModel($this->db);
        $this->userStatsModel = new UserStatsModel($this->db);
        $this->userStatus = new UserStatusModel($this->db);
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
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $player = $this->players[$from];
        $data = json_decode($msg, true);
        //echo "Message from {$player->userID}: {$msg}\n";

        if ($data['type'] === 'authenticate') {
            $userID = $data['data']['userID'] ?? null;
            echo "DEBUG: Received authenticate request with userID: " . var_export($userID, true) . "\n";
            if ($userID) {
                $user = $this->userModel->getUserById($userID);
                echo "DEBUG: getUserById returned: " . var_export($user, true) . "\n";
                if ($user) {
                    $player->userID = $user['id'];
                    $player->username = $user['username'];
                    $player->send([
                        'type' => 'connected',
                        'data' => [
                            'playerID' => $player->userID,
                            'username' => $player->username,
                            'message' => 'Successfully connected!'
                    ]
                    ]);
                } else {
                    echo "DEBUG: User not found in database for userID={$userID}\n";
                    $player->send([
                    'type' => 'error',
                    'data' => [
                        'errorMessage' => 'Authentication failed: User not found'
                    ]
                    ]);
                }
            } else {
            echo "DEBUG: No userID provided in authenticate message\n";
            $player->send([
                'type' => 'error',
                'data' => [
                    'errorMessage' => 'Authentication failed: No userID provided'
                ]
                ]);
            }
        }
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

                if ($game['mode'] === 'remote') {
                    $currentState = $game['engine']->update();
                    //disconnected player automatacly loses
                    $winnerId = $opponent->userID;
                    $loserId = $player->userID;

                    $goalsWinner = ($opponent->paddle === 'left')
                        ? $currentState['leftPaddle']['score']
                        : $currentState['rightPaddle']['score'];
                    
                    $goalsLoser = ($opponent->paddle === 'left')
                        ? $currentState['rightPaddle']['score']
                        : $currentState['leftPaddle']['score'];
                    // Match beenden und Stats aufzeichnen
                    $this->matchesModel->endMatch($gameID, $winnerId);
                    $this->userStatsModel->recordMatchResult($winnerId, $loserId, $goalsWinner, $goalsLoser);

                    $this->userStatus->setCurrentMatch($winnerId, null);
                    $this->userStatus->setCurrentMatch($loserId, null);
                } else { //maybe needed for AI
                    $this->userStatus->setCurrentMatch($player->userID, null);
                }
                $opponent->gameID = null;
                $opponent->paddle = null;
            } else {
                if ($game['mode'] === 'local') {
                    $this->userStatus->setCurrentMatch($player->userID, null);    
                }
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
        echo "Player {$player->userID} searching for match...\n";
        //check if Player is in game
        if ($this->userStatus->isInMatch($player->userID)) {
            $player->send([
                'type' => 'error',
                'data' => [
                    'errorMessage' => 'You are already in a game.'
                ]
            ]);
            return;
        }
        if (count($this->waitingPlayers) > 0) {
            $opponent = array_shift($this->waitingPlayers);
            echo "Match found! {$player->userID} vs {$opponent->userID}\n";

            // Create match in database and use matchId as gameID
            $gameID = $this->matchesModel->createMatch($player->userID, $opponent->userID);
            if (!$gameID) {
                echo "ERROR: Failed to create match in database!\n";//david said maybe return 500
                return;
            }
            
            $player->gameID = $gameID;
            $player->paddle = 'left';

            $opponent->gameID = $gameID;
            $opponent->paddle = 'right';

            echo "Match created in DB with ID: {$gameID}\n";
            //set user Status in match
            $this->userStatus->setCurrentMatch($player->userID, $gameID);
            $this->userStatus->setCurrentMatch($opponent->userID, $gameID);
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
                'matchId' => $gameID,
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

    private function startLocalGame(Player $player): void {
        echo "Player {$player->userID} starting local game...\n";
        //check if Player is in game
        if ($this->userStatus->isInMatch($player->userID)) {
            $player->send([
                'type' => 'error',
                'data' => [
                    'errorMessage' => 'You are already in a game.'
                ]
            ]);
            return;
        }
        $gameID = (int)(microtime(true) * 1000);
        $player->gameID = $gameID;
        $player->paddle = 'both';

        //set user Status in match
        $this->userStatus->setCurrentMatch($player->userID, $gameID);
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
        foreach ($this->games as $gameID => $_) {
            $this->updateGame($gameID);
        }
    }

    private function updateGame(string $gameID): void {
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];
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
                if ($game['mode'] === 'remote') {
                    $this->matchesModel->updateScore(
                        $gameID,
                        $newState['leftPaddle']['score'],
                        $newState['rightPaddle']['score']);
                }
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
            $msgGameOver = [
                'type' => 'gameOver',
                'data' => [
                    'winner' => $newState['winner']
                ]
            ];

            if ($game['mode'] === 'local') {
                $game['player1']->send($msgGameOver);
                $this->userStatus->setCurrentMatch($game['player1']->userID, null);
            } else {
                $winnerId = ($newState['winner'] === 'left')
                    ? $game['player1']->userID
                    : $game['player2']->userID;
                $loserId = ($newState['winner'] === 'left')
                    ? $game['player2']->userID
                    : $game['player1']->userID;
                
                $goalsWinner = ($newState['winner'] === 'left')
                    ? $newState['leftPaddle']['score']
                    : $newState['rightPaddle']['score'];
                
                $goalsLoser = ($newState['winner'] === 'left')
                    ? $newState['rightPaddle']['score']
                    : $newState['leftPaddle']['score'];
                $this->matchesModel->endMatch($gameID, $winnerId);
                $this->userStatsModel->recordMatchResult($winnerId, $loserId, $goalsWinner, $goalsLoser);

                $this->userStatus->setCurrentMatch($game['player1']->userID, null);
                $this->userStatus->setCurrentMatch($game['player2']->userID, null);

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