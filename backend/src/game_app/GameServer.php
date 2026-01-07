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
    private const GAME_TICK = 0.016;

    protected \SplObjectStorage $players;
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
        $this->initializeDatabase();
        $this->setupGameLoop();
    }

    private function initializeDatabase(): void {
        $this->db = new Database('sqlite:/var/www/html/database/transcendence.db');
        $this->userModel = new UserModel($this->db);
        $this->matchesModel = new MatchesModel($this->db);
        $this->userStatsModel = new UserStatsModel($this->db);
        $this->userStatus = new UserStatusModel($this->db);
        echo "GameServer initialized\n";
    }

    private function setupGameLoop(): void {
        if ($this->loop) {
            $this->loop->addPeriodicTimer(self::GAME_TICK, function() {
                $this->updateAllGames();
            }
        );
            echo "Game loop timer registered\n";
        } else {
            echo "WARNING: No event loop provided!\n";
        }
    }

    /*
    Websocket Ratchet functions
    */
    public function onOpen(ConnectionInterface $conn) {
        $this->players[$conn] = new Player($conn);
        echo "New connection: {$conn->resourceId}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $player = $this->players[$from];
        $data = json_decode($msg, true);
        match($data['type'] ?? null) {
            'authenticate' => $this->handleAuthentication($player, $data['data'] ?? []),
            'join' => $this->handleJoin($player, $data['data'] ?? []),
            'input' => $this->handleInput($player, $data['data'] ?? []),
            default => null
        };
    }

    public function onClose(ConnectionInterface $conn) {
        if (!isset($this->players[$conn])) return;

        $player = $this->players[$conn];
        $this->removePlayerFromQueue($player);
        $this->handlePlayerDisconnect($player);
        unset($this->players[$conn]);
        echo "Connection closed: {$player->userID}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    //helper functions for websocket functions
    private function handleAuthentication(Player $player, array $data): void {
        $userID = $data['userID'] ?? null;
        if (!$userID) {
            $this->sendError($player, 'No userID povided');
            return;
        }
        $user = $this->userModel->getUserById($userID);
        if (!$user) {
            $this->sendError($player, 'User not found');
            return;
        }
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
    }

    private function handleJoin(Player $player, array $data): void {
        $gameMode = $data['gameMode'] ?? 'remote';
        if ($gameMode === 'local') {
            $this->startLocalGame($player);
        } elseif ($gameMode === 'remote') {
            $this->startRemoteGame($player);
        }
    }

    private function handleInput(Player $player, array $data): void {
        if (!$player->gameID || !isset($this->games[$player->gameID])) {
            return;
        }
        $game = $this->games[$player->gameID];
        $engine = $game['engine'];
        $action = $data['action'] ?? null;
        //check which paddle to control for local mode
        if ($game['mode'] === 'local') {
            $paddle = $data['paddle'] ?? null;
            if (!$paddle) {
                return;
            }
        } else {
            $paddle = $player->paddle;
        }
        //set movement direction for paddle when buttom pressed / released
        if ($action === 'keydown') {
            $direction = $data['direction'] ?? null;
            if ($direction === 'up') {
                $engine->setPaddleVelocity($paddle, -1);
            } elseif ($direction === 'down') {
                $engine->setPaddleVelocity($paddle, 1);
            }
        } elseif ($action === 'keyup') {
            $engine->setPaddleVelocity($paddle, 0);
        }
    }

    private function removePlayerFromQueue(Player $player): void {
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => $p->userID !== $player->userID
        );
    }

    private function handlePlayerDisconnect(Player $player): void {
        if (!$player->gameID || !isset($this->games[$player->gameID])) return;

        $game = $this->games[$player->gameID];
        $opponent = $this->getOpponent($player, $game);

        if ($opponent) {
            $this->notifyOpponentDisconnect($opponent, $player, $game);
        }

        $this->endGame($player->gameID, $opponent?->userID, true);
    }

    private function getOpponent(Player $player, array $game): ?Player {
        if ($game['player1']->userID === $player->userID) {
            return $game['player2'];
        }
        if ($game['player2'] && $game['player2']->userID === $player->userID) {
            return $game['player1'];
        }
        return null;
    }

    private function notifyOpponentDisconnect(Player $opponent, Player $disconnectedPlayer, array $game): void {
        $opponent->send([
            'type' => 'opponentDisconnected',
            'data' => [
                'message' => 'Opponent disconnected. You win!',
                'winner' => $opponent->paddle
            ]
        ]);
    }

    private function endGame(string $gameID, ?string $winnerId = null, bool $isDisconnect = false): void {
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];
        
        if ($game['mode'] === 'remote' && $winnerId) {
            $this->recordMatchResults($gameID, $game, $winnerId);
        }

        $this->cleanupGame($game);
        unset($this->games[$gameID]);
    }

    private function recordMatchResults(string $gameID, array $game, string $winnerId): void {
        $state = $game['engine']->update();
        
        $loserId = ($winnerId === $game['player1']->userID) 
            ? $game['player2']->userID 
            : $game['player1']->userID;

        $isLeftWinner = ($game['player1']->userID === $winnerId);
        $goalsWinner = $isLeftWinner ? $state['leftPaddle']['score'] : $state['rightPaddle']['score'];
        $goalsLoser = $isLeftWinner ? $state['rightPaddle']['score'] : $state['leftPaddle']['score'];

        $this->matchesModel->endMatch($gameID, $winnerId);
        $this->userStatsModel->recordMatchResult($winnerId, $loserId, $goalsWinner, $goalsLoser);
    }

    private function cleanupGame(array $game): void {
        $game['player1']->gameID = null;
        $game['player1']->paddle = null;
        $this->userStatus->setCurrentMatch($game['player1']->userID, null);

        if ($game['player2']) {
            $game['player2']->gameID = null;
            $game['player2']->paddle = null;
            $this->userStatus->setCurrentMatch($game['player2']->userID, null);
        }
    }

    /*
    Remote server logic
    */
    private function startRemoteGame(Player $player): void {
        if ($this->isPlayerBusy($player)) {
            return;
        }

        if (count($this->waitingPlayers) > 0) {
            $this->createRemoteMatch($player, array_shift($this->waitingPlayers));
        } else {
            $this->waitingPlayers[] = $player;
            echo "Player {$player->userID} added to waiting queue.\n";
        }
    }

    private function isPlayerBusy(Player $player): bool {
        if ($player->gameID !== null) {
            $this->sendError($player, 'You are already in a game.');
            return true;
        }

        foreach ($this->waitingPlayers as $waitingPlayer) {
            if ($waitingPlayer->userID === $player->userID) {
                $this->sendError($player, 'You are already searching for a game.');
                return true;
            }
        }

        return false;
    }

    private function createRemoteMatch(Player $player1, Player $player2): void {
        $gameID = $this->matchesModel->createMatch($player1->userID, $player2->userID);
        
        if (!$gameID) {
            echo "ERROR: Failed to create match in database!\n";
            return;
        }

        $this->initializeGame($gameID, $player1, $player2, 'remote');
        echo "Match created: {$player1->userID} vs {$player2->userID} (ID: {$gameID})\n";
    }

    private function initializeGame(string $gameID, Player $player1, ?Player $player2, string $mode): void {
        $player1->gameID = $gameID;
        $player1->paddle = $mode === 'local' ? 'both' : 'left';
        
        if ($player2) {
            $player2->gameID = $gameID;
            $player2->paddle = 'right';
            $this->userStatus->setCurrentMatch($player2->userID, $gameID);
        }

        $this->userStatus->setCurrentMatch($player1->userID, $gameID);

        $this->games[$gameID] = [
            'player1' => $player1,
            'player2' => $player2,
            'mode' => $mode,
            'matchId' => $gameID,
            'started' => time(),
            'engine' => null,
            'lastLeftScore' => 0,
            'lastRightScore' => 0,
            'countdownFinished' => false,
            'isLocalGame' => $mode === 'local'
        ];

        $this->notifyMatchStart($player1, $player2, $gameID, $mode);
    }

    private function notifyMatchStart(Player $player1, ?Player $player2, string $gameID, string $mode): void {
        $player1->send([
            'type' => 'matchFound',
            'data' => [
                'message' => $mode === 'local' ? 'Local game started!' : 'Match found! Starting game.',
                'paddle' => $mode === 'local' ? 'both' : 'left',
                'gameID' => $gameID
            ]
        ]);

        if ($player2) {
            $player2->send([
                'type' => 'matchFound',
                'data' => [
                    'message' => 'Match found! Starting game.',
                    'paddle' => 'right',
                    'gameID' => $gameID
                ]
            ]);
        }
    }

    /*
    Local server logic
    */
    private function startLocalGame(Player $player): void {
        $gameID = (int)(microtime(true) * 1000);
        $this->initializeGame($gameID, $player, null, 'local');
        echo "Local game started for player {$player->userID}\n";
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
        //wait for countdown
        if (!$game['countdownFinished']) {
            if (time() - $game['started'] >= 4) {
                $this->games[$gameID]['countdownFinished'] = true;
                $this->games[$gameID]['engine'] = new GameEngine($gameID);
                echo "countdown completed\n";
            }
            return;
        }
        
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

    private function sendError(Player $player, string $message): void {
        $player->send([
            'type' => 'error',
            'data' => ['errorMessage' => "Authentication failed: {$message}"]
        ]);
    }
}