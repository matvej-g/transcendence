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

    protected \SplObjectStorage $players;
    private array $waitingPlayers = [];
    private array $waitingTournamentPlayers = [];
    private array $games = [];
    private array $tournamentGames = [];
    private array $tournamentRoundWinners = [];
    private array $tournamentPlayers = []; // Track all players per tournament
    private $loop;

    private Database $db;
    private UserModel $userModel;
    private TournamentsModel $tournamentModel;
    private MatchesModel $matchesModel;
    private UserStatsModel $userStatsModel;
    private UserStatusModel $userStatus;

    private TournamentPlayerModel $tournamentPlayerModel;
    private TournamentMatchesModel $tournamentMatchesModel;

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
        $this->tournamentModel = new TournamentsModel($this->db);
        $this->tournamentPlayerModel = new TournamentPlayerModel($this->db);
        $this->tournamentMatchesModel = new TournamentMatchesModel($this->db);
        // TournamentLogic is now static utility class; no instantiation needed
        $this->cleanupOrphanedLocalGames();
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
        // If player is in a tournament, set their slot to null and clean up if needed
        $tournamentID = $this->getPlayerTournamentId($player);
        if ($tournamentID !== null) {
            foreach ($this->tournamentPlayers[$tournamentID] as $idx => $p) {
                if ($p && $p->userID === $player->userID) {
                    $this->tournamentPlayers[$tournamentID][$idx] = null;
                }
            }
            // If all slots are null, clean up the tournament entry
            $allNull = true;
            foreach ($this->tournamentPlayers[$tournamentID] as $p) {
                if ($p !== null) {
                    $allNull = false;
                    break;
                }
            }
            if ($allNull) {
                unset($this->tournamentPlayers[$tournamentID]);
            }
        }
        $this->handlePlayerDisconnect($player);
        unset($this->players[$conn]);
        echo "Connection closed: {$player->userID}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    private function endGame(string $gameID, ?string $winnerId = null, bool $isDisconnect = false): void {
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];

        // Debug: Print round winners before logic
        if (!isset($this->games[$gameID])) return;

        $game = $this->games[$gameID];

        if ($game['mode'] === 'remote' && $winnerId) { //evtl auch fuer localGame nutzen
            $this->recordMatchResults($gameID, $game, $winnerId);
        }

        // Always clean up and remove the game before checking for round progression
        $isTournament = ($game['mode'] === 'tournament' && isset($game['tournamentId']));
        $tournamentID = $isTournament ? $game['tournamentId'] : null;
        $round = $isTournament ? ($game['round'] ?? 1) : null;

        $this->cleanupGame($game);
        unset($this->games[$gameID]);

        // Debug: Print round winners before logic
        if ($isTournament) {
            $winnersSoFar = isset($this->tournamentRoundWinners[$tournamentID][$round]) ? count($this->tournamentRoundWinners[$tournamentID][$round]) : 0;
            echo "[DEBUG] Tournament $tournamentID, Round $round, Winners so far: $winnersSoFar\n";
        }

        if ($isTournament) {
            if (!isset($this->tournamentRoundWinners[$tournamentID][$round])) {
                $this->tournamentRoundWinners[$tournamentID][$round] = [];
            }
            $winnerPlayer = ($winnerId === $game['player1']->userID) ? $game['player1'] : $game['player2'];
            $this->tournamentRoundWinners[$tournamentID][$round][] = $winnerPlayer;

            // Check if all games for this round are finished
            $allGamesThisRound = array_filter($this->games, function($g) use ($tournamentID, $round) {
                return $g['mode'] === 'tournament' && ($g['tournamentId'] ?? null) === $tournamentID && ($g['round'] ?? 1) === $round;
            });

            if (count($allGamesThisRound) === 0) {
                echo "[DEBUG] All games finished for tournament $tournamentID round $round. Starting next round if possible.\n";
                $nextRoundPlayers = $this->tournamentRoundWinners[$tournamentID][$round];
                echo "[DEBUG] Next round players: ";
                foreach ($nextRoundPlayers as $p) {
                    if ($p) {
                        echo (property_exists($p, 'userID') ? $p->userID : '[not a Player object]') . ' ';
                    } else {
                        echo '[null] ';
                    }
                }
                echo "\n";
                // Start next round if more than 1 player left
                if (count($nextRoundPlayers) > 1) {
                    // Only reset winners for the next round if not already set
                    if (!isset($this->tournamentRoundWinners[$tournamentID][$round + 1])) {
                        $this->tournamentRoundWinners[$tournamentID][$round + 1] = [];
                    }
                    $this->startNextTournamentRound($tournamentID, $nextRoundPlayers, $round + 1);
                    // Prevent duplicate next round triggers
                    $this->tournamentRoundWinners[$tournamentID][$round] = [];
                } else {
                    // Tournament winner found
                    $champion = $nextRoundPlayers[0];
                    $champion->send([
                        'type' => 'tournamentWin',
                        'data' => [
                            'message' => 'Congratulations! You are the tournament winner!'
                        ]
                    ]);
                    // Clean up tournament player list after tournament ends
                    if ($tournamentID !== null) {
                        unset($this->tournamentPlayers[$tournamentID]);
                    }
                }
            }
        }
    }

    // Helper to start the next round of a tournament
    private function startNextTournamentRound(int $tournamentID, array $players, int $round): void {
                echo "[DEBUG] startNextTournamentRound: tournament $tournamentID, round $round, players: ";
                foreach ($players as $p) {
                    if ($p) {
                        echo (property_exists($p, 'userID') ? $p->userID : '[not a Player object]') . ' ';
                    } else {
                        echo '[null] ';
                    }
                }
                echo "\n";
        $pairs = TournamentLogic::getNextRoundPairs($players);
        foreach ($pairs as $pair) {
            if (count($pair) === 2) {
                [$player1, $player2] = $pair;
                $gameID = $this->matchesModel->createMatch($player1->userID, $player2->userID);
                $this->initializeGame($gameID, $player1, $player2, 'tournament', $tournamentID, $round);
                $this->notifyMatchTournament($pair, $gameID, $tournamentID);
                if ($this->loop) {
                    $this->loop->addTimer(30, function() use ($gameID) {
                        if (isset($this->games[$gameID])) {
                            $this->games[$gameID]['countdownFinished'] = true;
                            $this->games[$gameID]['engine'] = new GameEngine($gameID);
                        }
                    });
                }
            } else {
                // Bye: player advances automatically
                $this->tournamentRoundWinners[$tournamentID][$round][] = $pair[0];
                $pair[0]->send([
                    'type' => 'tournamentDC',
                    'data' => [
                        'message' => "Round $round: You advance automatically!"
                    ]
                ]);
            }
        }
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
        if ($game['player1']->userID === $player->userID) {
            $this->sendAlreadyInGame($player);
            return true;
        }
        if ($game['player2'] && $game['player2']->userID === $player->userID) {
            $this->sendAlreadyInGame($player);
            return true;
            }
        }
    foreach ($this->waitingPlayers as $waitingPlayer) {
        if ($waitingPlayer->userID === $player->userID) {
            $player->send([
                'type' => 'alreadySearching',
                'data' => ['message' => 'You are already searching for a game.']
            ]);
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

        $this->notifyMatchStart($player1, $player2, $gameID, $mode);
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

        // For tournament games, only start after the 30s timer (handled by addTimer)
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

            if ($game['mode'] === 'remote') {
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
        if ($game['player2']) {
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
        if ($this->isPlayerBusy($player)) {
            echo "Player {$player->userID} tried to connect but is already in a game. Closing connection.\n";
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
        if ($gameMode === 'local') {
            $this->startLocalGame($player);
        } elseif ($gameMode === 'remote') {
            $this->startRemoteGame($player);
        } elseif ($gameMode === 'joinT') {
            $this->joinTournament($player);
        } elseif ($gameMode === 'hostT') {
            $this->hostTournament($player);
        }
    }

    private function joinTournament(Player $player): void {
        if ($this->isPlayerBusy($player)) {
            return;
        }
        $this->waitingTournamentPlayers[] = $player;
        if (count($this->waitingTournamentPlayers) == 8) {
            $this->joinTournamentGames($this->waitingTournamentPlayers);
            $this->waitingTournamentPlayers = [];
        } else {
            echo "Player {$player->userID} added to Tournament waiting queue.\n";
        }
    }

    private function joinTournamentGames(array $tournamentPlayers): void {
        $pairs = TournamentLogic::shufflePlayers($tournamentPlayers);
        $flatPlayers = [];
        foreach ($pairs as $pair) {
            foreach ($pair as $player) {
                $flatPlayers[] = $player;
            }
        }
        $tournamentName = uniqid('tournament_');
        $tournamentID = $this->tournamentModel->createTournament($tournamentName);
        $this->tournamentGames[] = $tournamentID;
        $this->tournamentPlayers[$tournamentID] = $flatPlayers;

        $this->startNextTournamentRound($tournamentID, $flatPlayers, 1);
    }

    private function getPlayerTournamentId(Player $player): ?int {
        foreach ($this->tournamentPlayers as $tournamentID => $players) {
            foreach ($players as $p) {
                if ($p !== null && $p->userID === $player->userID) {
                    return $tournamentID;
                }
            }
        }
        return null;
    }

    private function notifyMatchTournament(array $pair, string $gameID, int $tournamentID): void {
        [$player1, $player2] = $pair;
        $this->initializeGame($gameID, $player1, $player2, 'tournament', $tournamentID);
        $player1->send([
            'type' => 'tournamentMatchAnnounce',
            'data' => [
                'message' => 'Tournament match found! Starting game.',
                'paddle' => 'left',
                'gameID' => $gameID,
                'opponent' => $player2->username ?? 'Opponent'
            ]
        ]);
        $player2->send([
            'type' => 'tournamentMatchAnnounce',
            'data' => [
                'message' => 'Tournament match found! Starting game.',
                'paddle' => 'right',
                'gameID' => $gameID,
                'opponent' => $player1->username ?? 'Opponent'
            ]
        ]);
    }

    private function hostTournament(Player $player): void {
        if ($this->isPlayerBusy($player)) {
            return;
        }
        // $number = count($this->tournamentGames);
        // $this->tournamentGames[] = $number;
        $this->waitingTournamentPlayers[] = $player;
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
        $this->waitingTournamentPlayers = array_filter(
            $this->waitingTournamentPlayers,
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

    private function sendAlreadyInGame(Player $player): void {
        $player->send([
            'type' => 'alreadyInGame',
            'data' => [
                'message' => 'You are Already in a game.',
            ]
        ]);
    }

    private function cleanupOrphanedLocalGames(): void {
        $query = "DELETE FROM matches WHERE player_one_id = player_two_id";
        $this->db->query($query);
        echo "Cleaned up orphaned local games\n";
    }
}