<?php
namespace Pong;

use Pong\TournamentLogic;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
//Database Models
use src\Database;
use src\Models\UserModel;
use src\Models\MatchesModel;
use src\Models\UserStatsModel;
use src\Models\UserStatusModel;
//for Tournament
use src\Models\TournamentsModel;
use src\Models\TournamentPlayerModel;
use src\Models\TournamentMatchesModel;



class GameServer implements MessageComponentInterface {
    private const GAME_TICK = 0.016;
    private const COUNTDOWN_DURATION = 4;
    private const TOURNAMENT_COUNTDOWN = 30;

    protected \SplObjectStorage $players;
    private array $waitingPlayers = [];
    private array $games = [];
    private $loop;
    private array $pendingInvites = [];

    private Database $db;
    private UserModel $userModel;
    private MatchesModel $matchesModel;
    private UserStatsModel $userStatsModel;
    private UserStatusModel $userStatus;
    private TournamentMatchesModel $tournamentMatchesModel;

    private TournamentLogic $tournament;

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
        $this->tournamentMatchesModel = new TournamentMatchesModel($this->db);
        $this->tournament = new TournamentLogic(
            new TournamentsModel($this->db),
            $this->userStatsModel
        );

        //callbacks for tournament
        $this->tournament->setCallbacks(
            fn($tID, $p1, $p2, $round) => $this->createTournamentMatch($tID, $p1, $p2, $round),
            fn($pair, $gameID, $tID) => $this->notifyMatchTournament($pair, $gameID, $tID),
            fn($userID) => $this->getPlayerByUserId($userID)
        );
        echo "GameServer initialized\n";
    }

    private function setupGameLoop(): void {
        if ($this->loop) {
            $this->loop->addPeriodicTimer(self::GAME_TICK, function() {
                $this->updateAllGames();
                }
            );
            echo "Game loop timer registered\n";
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
            'invite' => $this->handleInvite($player, $data['data'] ?? []),
            default => null
        };
    }

    public function onClose(ConnectionInterface $conn) {
        if (!isset($this->players[$conn])) return;

        $player = $this->players[$conn];
        $this->removePlayerFromQueue($player);

        $this->tournament->onPlayerDisconnect($player);
        foreach ($this->tournament->getWaitingPlayers() as $player) {
            $player->send([
                'type' => 'tournamentQueue',
                'data' => [
                    'message' => 'Joined tournament queue',
                    'waiting' => $this->tournament->getWaitingCount()
                ]
            ]);
        }
        $this->handlePlayerDisconnect($player);
        $userId = $player->userID ?? $conn->resourceId;
        $this->userStatus->setBusyStatus($userId, 0);
        unset($this->players[$conn]);
        echo "Connection closed: {$userId}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    private function endGame(string $gameID, ?string $winnerId = null, bool $isDisconnect = false): void {
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];
        if (($game['mode'] === 'remote' || $game['mode'] === 'tournament') && $winnerId && $game['engine'] !== null) {
            $this->recordMatchResults($gameID, $game, $winnerId);
        }
        if ($game['mode'] === 'tournament' && isset($game['tournamentId'])) {
            $tournamentID = $game['tournamentId'];
            $round = $game['round'] ?? 1;
            $winnerPlayer = ($winnerId === $game['player1']->userID) 
                ? $game['player1'] 
                : $game['player2'];
            $this->tournament->onMatchEnd($tournamentID, $round, $winnerPlayer);
            $this->notifyResultTournamentMatch($tournamentID, $round, $game['player1'], $game['player2']);
        }
        $this->cleanupGame($game);
        unset($this->games[$gameID]);

        if ($game['mode'] === 'tournament' && isset($game['tournamentId'])) {
            $activeGames = $this->countActiveTournamentGames($tournamentID, $round);
             $this->tournament->checkRoundComplete($tournamentID, $round, $activeGames);
        }
    }

    private function countActiveTournamentGames(int $tournamentID, int $round): int {
        return count(array_filter($this->games, fn($g) => 
            $g['mode'] === 'tournament' && 
            ($g['tournamentId'] ?? null) === $tournamentID && 
            ($g['round'] ?? 1) === $round
        ));
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
        if ($game['mode'] !== 'local') {
            $this->userStatus->setCurrentMatch($game['player1']->userID, null);
        }     
        if ($game['player2'] && $game['mode'] !== 'local') {
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
        foreach ($this->games as $game) {
            if ($game['player1']->userID === $player->userID ||
                ($game['player2'] && $game['player2']->userID === $player->userID)) {
                    $player->send([
                        'type' => 'alreadySearching',
                        'data' => ['message' => 'You are Already in a game.',]
                    ]);
                return true;
            }
        } 
        foreach ($this->waitingPlayers as $p) {
            if ($p->userID === $player->userID) {
                $player->send([
                    'type' => 'alreadySearching',
                    'data' => ['message' => 'You are already searching for a game.']
                ]);
                return true;
            }
        }
        if ($this->tournament->isPlayerWaiting($player)) {
            $player->send([
                'type' => 'alreadySearching',
                'data' => ['message' => 'You are already in the tournament queue.']
            ]);
            return true;
        }
        if ($this->tournament->getPlayerTournamentId($player) !== null) {
            $player->send([
                'type' => 'alreadySearching',
                'data' => ['message' => 'You are already in a tournament.']
            ]);
            return true;
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

    private function initializeGame(string $gameID, Player $player1, ?Player $player2, string $mode, ?int $tournamentId = null, ?int $round = 1): void {
        $player1->gameID = $gameID;
        $player1->paddle = $mode === 'local' ? 'both' : 'left';
        
        if ($player2 && $mode !== 'local') {
            $player2->gameID = $gameID;
            $player2->paddle = 'right';
            $this->userStatus->setCurrentMatch($player2->userID, $gameID);
        }
        if ($mode !== 'local') {
            $this->userStatus->setCurrentMatch($player1->userID, $gameID);
        }

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
            'isLocalGame' => $mode === 'local',
            'tournamentId' => $tournamentId,
            'round' => $round
        ];

        if ($mode !== 'tournament') {
            $this->notifyMatchStart($player1, $player2, $gameID, $mode);
        }
    }

    private function notifyMatchStart(Player $player1, ?Player $player2, string $gameID, string $mode): void {
        $player1Name = $player1->username ?? 'Player 1';
        $player2Name = $player2 ? ($player2->username ?? 'Player 2') : 'Player 2';
        if ($mode === 'local') {
            $player1Name = NULL;
            $player2Name = NULL;
        }
        $player1->send([
            'type' => 'matchFound',
            'data' => [
                'message' => $mode === 'local' ? 'Local game started!' : 'Match found! Starting game.',
                'paddle' => $mode === 'local' ? 'both' : 'left',
                'gameID' => $gameID,
                'leftPlayerName' => $player1Name,
                'rightPlayerName' => $player2Name
            ]
        ]);

        if ($player2) {
            $player2->send([
                'type' => 'matchFound',
                'data' => [
                    'message' => 'Match found! Starting game.',
                    'paddle' => 'right',
                    'gameID' => $gameID,
                    'leftPlayerName' => $player1Name,
                    'rightPlayerName' => $player2Name  
                ]
            ]);
        }
    }

    /*
    Local server logic
    */
    private function startLocalGame(Player $player): void {
        if ($this->isPlayerBusy($player)) {
            return;
        }
        $gameID = 'local_' . uniqid();
        $this->initializeGame($gameID, $player, $player, 'local');
        echo "Local game started for player {$player->userID} with ID {$gameID}\n";
    }

    /*
    Server Update/Loop logic
    */
    private function updateAllGames(): void {
        foreach ($this->games as $gameID => $_) {
            $this->updateGame($gameID);
        }
    }

    private function updateGame(string $gameID): void {
        if (!isset($this->games[$gameID])) return;

        $game = &$this->games[$gameID];

        if (!$this->checkCountdown($gameID, $game)) {
            return;
        }

        $newState = $game['engine']->update();
        $this->broadcastGameState($game, $newState);
        $this->checkGameEnd($gameID, $game, $newState);
    }

    private function checkCountdown(string $gameID, array $game): bool {
        if ($game['countdownFinished']) {
            return true;
        }
        // tournament games, has its own timer
        if ($game['mode'] === 'tournament') {
            return false;
        }

        if (time() - $game['started'] >= self::COUNTDOWN_DURATION) {
            $this->games[$gameID]['countdownFinished'] = true;
            $this->games[$gameID]['engine'] = new GameEngine($gameID);
            echo "Countdown completed for game {$gameID}\n";
            return true;
        }
        return false;
    }

    private function broadcastGameState(array $game, array $state): void {
        $message = [
            'type' => 'gameUpdate',
            'data' => [
                'leftPaddleY' => $state['leftPaddle']['y'],
                'rightPaddleY' => $state['rightPaddle']['y'],
                'ballX' => $state['ball']['x'],
                'ballY' => $state['ball']['y'],
            ]
        ];

        $this->updateScoreIfChanged($game, $state, $message);

        $game['player1']->send($message);
        if ($game['player2']) {
            $game['player2']->send($message);
        }
    }

    private function updateScoreIfChanged(array &$game, array $state, array &$message): void {
        $leftScore = $state['leftPaddle']['score'];
        $rightScore = $state['rightPaddle']['score'];

        if ($leftScore !== $game['lastLeftScore'] || $rightScore !== $game['lastRightScore']) {
            $message['data']['leftScore'] = $leftScore;
            $message['data']['rightScore'] = $rightScore;

            if ($game['mode'] === 'remote' || $game['mode'] === 'tournament') {
                $this->matchesModel->updateScore($game['matchId'], $leftScore, $rightScore);
            }

            $game['lastLeftScore'] = $leftScore;
            $game['lastRightScore'] = $rightScore;
        }
    }

    private function checkGameEnd(string $gameID, array $game, array $state): void {
        if ($state['winner'] === null) return;

        echo "Game {$gameID} finished! Winner: {$state['winner']}\n";

        $this->broadcastGameOver($game, $state['winner']);

        $winnerId = ($state['winner'] === 'left') 
            ? $game['player1']->userID 
            : $game['player2']?->userID;

        $this->endGame($gameID, $winnerId);
    }

    private function broadcastGameOver(array $game, string $winner): void {
        $message = [
            'type' => 'gameOver',
            'data' => ['winner' => $winner]
        ];

        $game['player1']->send($message);
        if ($game['player2'] && $game['mode'] !== 'local') {
            $game['player2']->send($message);
        }
    }

    /*
    Helper Functions
    */
    private function sendError(Player $player, string $message): void {
        $player->send([
            'type' => 'error',
            'data' => ['errorMessage' => "Authentication failed: {$message}"]
        ]);
    }

    //helper functions for websocket functions
    private function handleAuthentication(Player $player, array $data): void {
        $token = $data['token'] ?? null;
        if (!is_string($token) || $token === '') {
            $this->sendError($player, 'No token provided');
            return;
        }

        $payload = verifyJWT($token);
        if ($payload === null) {
            $this->sendError($player, 'Invalid token');
            return;
        }

        $userID = (int)($payload['user_id'] ?? 0);
        if ($userID <= 0) {
            $this->sendError($player, 'Invalid user');
            return;
        }

        $this->userStatus->setBusyStatus($userID, 1);
        $user = $this->userModel->getUserById($userID);
        if (!$user) {
            $this->sendError($player, 'User not found');
            return;
        }
        $player->userID = $user['id'];
        $player->username = $user['username'];
        if ($this->isPlayerBusy($player)) {
            $player->conn->close();
            return;
        }
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
        
        match($gameMode) {
            'local' => $this->startLocalGame($player),
            'remote' => $this->startRemoteGame($player),
            'joinT' => $this->handleJoinTournament($player),
            default => null
        };
    }

    private function handleJoinTournament(Player $player): void {
        if ($this->isPlayerBusy($player)) {
            return;
        }
        $this->tournament->joinTournament($player);
        foreach ($this->tournament->getWaitingPlayers() as $player) {
            $player->send([
                'type' => 'tournamentQueue',
                'data' => [
                    'message' => 'Joined tournament queue',
                    'waiting' => $this->tournament->getWaitingCount()
                ]
            ]);
        }
    }

    private function createTournamentMatch(int $tournamentID, Player $player1, Player $player2, int $round): void {
        $gameID = $this->matchesModel->createMatch($player1->userID, $player2->userID);

        // Speichere Tournament-Match in DB für Historie
        $existingMatches = $this->tournamentMatchesModel->getMatchesForTournament($tournamentID);
        $matchesInRound = array_filter($existingMatches, fn($m) => $m['round'] == $round);
        $matchIndex = count($matchesInRound);
        $this->tournamentMatchesModel->createTournamentMatchWithRound($tournamentID, $gameID, $round, $matchIndex);

        $this->initializeGame($gameID, $player1, $player2, 'tournament', $tournamentID, $round);
        $this->notifyMatchTournament([$player1, $player2], $gameID, $tournamentID);

        if ($this->loop) {
            $this->loop->addTimer(self::TOURNAMENT_COUNTDOWN, function() use ($gameID) {
                if (isset($this->games[$gameID])) {
                    $this->games[$gameID]['countdownFinished'] = true;
                    $this->games[$gameID]['engine'] = new GameEngine($gameID);
                    $game = $this->games[$gameID];
                    $message = [
                        'type' => 'countdownFinished',
                        'data' => ['message' => 'Game starting!']
                    ];
                    $game['player1']->send($message);
                    $game['player2']->send($message);
                }
            });
        }
    }

    private function notifyMatchTournament(array $pair, string $gameID, int $tournamentID): void {
        [$player1, $player2] = $pair;
        $rounds = $this->tournament->getBracketData($tournamentID);
        $currentRound = $this->tournament->getCurrentRound($tournamentID);
        $player1->send([
            'type' => 'tournamentMatchAnnounce',
            'data' => [
                'message' => 'Tournament match found! Starting game.',
                'paddle' => 'left',
                'gameID' => $gameID,
                'player1' => $player1->username ?? 'Player 1',
                'player2' => $player2->username ?? 'Player 2',
                'rounds' => $rounds,
                'currentRound' => $currentRound
            ]
        ]);
        $player2->send([
            'type' => 'tournamentMatchAnnounce',
            'data' => [
                'message' => 'Tournament match found! Starting game.',
                'paddle' => 'right',
                'gameID' => $gameID,
                'player1' => $player1->username ?? 'Player 1',
                'player2' => $player2->username ?? 'Player 2',
                'rounds' => $rounds,
                'currentRound' => $currentRound
            ]
        ]);
    }

    private function notifyResultTournamentMatch(int $tournamentId, int $currentRound, Player $finishedPlayer1, Player $finishedPlayer2): void {
        $rounds = $this->tournament->getBracketData($tournamentId);
        $currentRoundNum = $this->tournament->getCurrentRound($tournamentId);
        $tournamentPlayers = $this->tournament->getTournamentPlayers($tournamentId);
        
        foreach ($tournamentPlayers as $player) {
            if ($player === null) continue;

            if ($player->userID === $finishedPlayer1->userID || 
                $player->userID === $finishedPlayer2->userID) {
                $player->send([
                    'type' => 'tournamentMatchEnd',
                    'data' => [
                        'rounds' => $rounds,
                        'currentRound' => $currentRoundNum
                    ]
                ]);
            } else {
                $player->send([
                    'type' => 'tournamentUpdate',
                    'data' => [
                        'rounds' => $rounds,
                        'currentRound' => $currentRoundNum
                    ]
                ]);
            }
        }
    }

    private function handleInput(Player $player, array $data): void {
        if (!$player->gameID || !isset($this->games[$player->gameID])) {
            return;
        }
        $game = $this->games[$player->gameID];
        if (!isset($game['engine'])) {
            return; // engine not ready yet
        }
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
            $velocity = match($direction) {
                'up' => -1,
                'down' => 1,
                default => 0
            };
            $engine->setPaddleVelocity($paddle, $velocity);
        } elseif ($action === 'keyup') {
            $engine->setPaddleVelocity($paddle, 0);
        }
    }

    private function handleInvite(Player $player, array $data): void {
        $inviteCode = $data['inviteCode'] ?? null;
        if (!$inviteCode) return;

        if (isset($this->pendingInvites[$inviteCode])) {
            $opponent = $this->pendingInvites[$inviteCode];
            unset($this->pendingInvites[$inviteCode]);
            $this->createRemoteMatch($player, $opponent);
        } else {
            $this->pendingInvites[$inviteCode] = $player;
        }
    }

    private function removePlayerFromQueue(Player $player): void {
        if (!isset($player->userID)) return;

        $playerObjectId = spl_object_id($player);
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => spl_object_id($p) !== $playerObjectId
        );
    }

    private function handlePlayerDisconnect(Player $player): void {
        if (!$player->gameID || !isset($this->games[$player->gameID])) return;

        $game = $this->games[$player->gameID];
        $opponent = $this->getOpponent($player, $game);

        $opponentConnected = $opponent && $this->isPlayerConnected($opponent);

        if ($opponentConnected) {
            $this->notifyOpponentDisconnect($opponent, $player, $game);
            $this->endGame($player->gameID, $opponent->userID, true);
        } else {
            $this->endGame($player->gameID, null, true);
        }
    }

    private function isPlayerConnected(Player $player): bool {
        foreach ($this->players as $conn) {
            $p = $this->players[$conn];
            if ($p->userID === $player->userID) {
                return true;
            }
        }
        return false;
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
        if ($game['mode'] === 'tournament' && isset($game['tournamentId'])) {
            $tournamentID = $game['tournamentId'];
            $rounds = $this->tournament->getBracketData($tournamentID);
            $currentRound = $this->tournament->getCurrentRound($tournamentID);
            $opponent->send([
                'type' => 'tournamentMatchEnd',
                'data' => [
                    'message' => 'Opponent disconnected. You advance!',
                    'rounds' => $rounds,
                    'currentRound' => $currentRound
                ]
            ]);
        } else {
            $opponent->send([
                'type' => 'opponentDisconnected',
                'data' => [
                    'message' => 'Opponent disconnected. You win!',
                    'winner' => $opponent->paddle
                ]
            ]);
        }
    }

    public function getPlayerByUserId(string $userID): ?Player {
        foreach ($this->players as $conn) {
            $player = $this->players[$conn];
            if ($player->userID === $userID) {
                return $player;
            }
        }
        return null;
    }
}