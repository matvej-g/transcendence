<?php
namespace Pong;

use src\Models\TournamentsModel;
use src\Models\UserStatsModel;
//use src\Models\TournamentPlayerModel;
//use src\Models\TournamentMatchesModel;

class TournamentLogic {
    private array $waitingPlayers = [];
    private array $tournamentGames = [];
    private array $tournamentRoundWinners = [];
    private array $tournamentPlayers = [];
    private array $tournamentBrackets = [];
    private array $tournamentCurrentRound = [];

    private TournamentsModel $tournamentModel;
    private UserStatsModel $userStatsModel;
    //private TournamentPlayerModel $tournamentPlayerModel;
    //private TournamentMatchesModel $tournamentMatchesModel;

    private $onCreateMatch;
    private $onMatchAnnounce;

    public function __construct(
        TournamentsModel $tournamentModel,
        UserStatsModel $userStatsModel
        //TournamentPlayerModel $tournamentPlayerModel,
        //TournamentMatchesModel $tournamentMatchesModel
    ) {
        $this->tournamentModel = $tournamentModel;
        $this->userStatsModel = $userStatsModel;
        //$this->tournamentPlayerModel = $tournamentPlayerModel;
        //$this->tournamentMatchesModel = $tournamentMatchesModel;
    }

    public function setCallbacks(callable $onCreateMatch, callable $onMatchAnnounce): void {
        $this->onCreateMatch = $onCreateMatch;
        $this->onMatchAnnounce = $onMatchAnnounce;
    }

    private function initializeBracket(int $tournamentID, array $players): void {
        $this->tournamentBrackets[$tournamentID] = [];
        $numRounds = self::getNumOfRounds(count($players));
        
        for ($round = 1; $round <= $numRounds; $round++) {
            $matchesInRound = count($players) / pow(2, $round);
            $this->tournamentBrackets[$tournamentID][$round] = [];
            
            for ($i = 0; $i < $matchesInRound; $i++) {
                $this->tournamentBrackets[$tournamentID][$round][] = [
                    'player1' => null,
                    'player2' => null,
                    'winner' => null
                ];
            }
        }
    }

    private function setBracketMatch(int $tournamentID, int $round, Player $player1, Player $player2): void {
        if (!isset($this->tournamentBrackets[$tournamentID][$round])) {
            return;
        }
        foreach ($this->tournamentBrackets[$tournamentID][$round] as $idx => &$match) {
            if ($match['player1'] === null && $match['player2'] === null) {
                $match['player1'] = $player1->username ?? "Player {$player1->userID}";
                $match['player2'] = $player2->username ?? "Player {$player2->userID}";
                return;
            }
        }
    }

    private function setBracketWinner(int $tournamentID, int $round, Player $winner): void {
        if (!isset($this->tournamentBrackets[$tournamentID][$round])) {
            return;
        }
        
        $winnerName = $winner->username ?? "Player {$winner->userID}";
        
        foreach ($this->tournamentBrackets[$tournamentID][$round] as $idx => &$match) {
            if (($match['player1'] === $winnerName || $match['player2'] === $winnerName) 
                && $match['winner'] === null) {
                $match['winner'] = $winnerName;
                return;
            }
        }
    }

    public function getBracketData(int $tournamentID): array {
        if (!isset($this->tournamentBrackets[$tournamentID])) {
            return [];
        }
        $rounds = [];
        ksort($this->tournamentBrackets[$tournamentID]);
        foreach ($this->tournamentBrackets[$tournamentID] as $round => $matches) {
            $rounds[] = $matches;
        }
        return $rounds;
    }

    public function joinTournament(Player $player): ?int {
        $this->waitingPlayers[] = $player;
        
        if (count($this->waitingPlayers) === 8) {
            $tournamentID = $this->startTournament($this->waitingPlayers);
            $this->waitingPlayers = [];
            return $tournamentID;
        }   
        echo "Player {$player->userID} added to Tournament waiting queue. ({$this->getWaitingCount()}/8)\n";
        return null;
    }

    private function startTournament(array $players): int {
        $pairs = self::shufflePlayers($players);
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
        $this->tournamentRoundWinners[$tournamentID] = [];
        $this->initializeBracket($tournamentID, $flatPlayers);
        // Record participation for all players
        $participantIds = array_map(fn($player) => $player->userID, $flatPlayers);
        $this->userStatsModel->recordTournamentParticipation($participantIds);
        echo "Tournament {$tournamentID} started with 8 players\n";
        $this->tournamentCurrentRound[$tournamentID] = 1;
        $this->startRound($tournamentID, $flatPlayers, 1);     
        return $tournamentID;
    }

    public function startRound(int $tournamentID, array $players, int $round): void {
        echo "[Tournament] Starting round {$round} for tournament {$tournamentID}\n";
        $pairs = self::getNextRoundPairs($players);
        foreach ($pairs as $pair) {
            if (count($pair) === 2) {
                $this->setBracketMatch($tournamentID, $round, $pair[0], $pair[1]);
            }
        }
        foreach ($pairs as $pair) {
            if (count($pair) === 2) {
                ($this->onCreateMatch)($tournamentID, $pair[0], $pair[1], $round);
            } else {
                // if a player leaves (dc) opponent wins
                $this->addRoundWinner($tournamentID, $round, $pair[0]);
                $pair[0]->send([
                    'type' => 'tournamentUpdate',
                    'data' => [
                        'message' => "Round {$round}: You advance automatically!",
                        'rounds' => $this->getBracketData($tournamentID),
                        'currentRound' => $this->getCurrentRound($tournamentID)
                    ]
                ]);
            }
        }
    }

    public function onMatchEnd(int $tournamentID, int $round, Player $winner): void {
        if ($winner === null) {
            return;
        }
        $this->setBracketWinner($tournamentID, $round, $winner);
        $this->addRoundWinner($tournamentID, $round, $winner);
        $winnersCount = count($this->tournamentRoundWinners[$tournamentID][$round] ?? []);
        $expectedWinners = $this->getExpectedWinnersForRound($round);
        echo "[Tournament] Round {$round} winner: {$winner->userID} ({$winnersCount}/{$expectedWinners})\n";
    }

    public function checkRoundComplete(int $tournamentID, int $round, int $activeGamesInRound): bool {
        if ($activeGamesInRound > 0) {
            return false;
        }
        $winners = [];
        foreach ($this->tournamentRoundWinners[$tournamentID][$round] ?? [] as $winner) {
            if ($winner !== null) {
                $winners[] = $winner;
            }
        }
        if (count($winners) === 0) {
            $this->cancelTournament($tournamentID, "All players disconnected");
            return true;
        }
        if (count($winners) === 1) {
            $this->onTournamentEnd($tournamentID, $winners[0]);
            return true;
        }
        $nextRound = $round + 1;
        $this->tournamentCurrentRound[$tournamentID] = $nextRound;
        $this->tournamentRoundWinners[$tournamentID][$nextRound] = [];
        $this->startRound($tournamentID, $winners, $nextRound);
        $this->tournamentRoundWinners[$tournamentID][$round] = [];
        return true;
    }

    private function onTournamentEnd(int $tournamentID, Player $champion): void {
        echo "[Tournament] Tournament {$tournamentID} finished! Winner: {$champion->userID}\n";
        $this->tournamentModel->endTournament($tournamentID, $champion->userID);
        $this->userStatsModel->recordTournamentWin((int) $champion->userID);
        $champion->send([
            'type' => 'tournamentWin',
            'data' => ['message' => 'Congratulations! You are the tournament champion! 🏆',
                        'winner' => $champion->username]
        ]);
        // Cleanup
        unset($this->tournamentCurrentRound[$tournamentID]);
        unset($this->tournamentPlayers[$tournamentID]);
        unset($this->tournamentRoundWinners[$tournamentID]);
        unset($this->tournamentBrackets[$tournamentID]);
    }

    public function onPlayerDisconnect(Player $player): void {
        if (!isset($player->userID)) {
            return;
        }
        $this->waitingPlayers = array_filter(
            $this->waitingPlayers,
            fn($p) => $p->userID !== $player->userID
        );
        $tournamentID = $this->getPlayerTournamentId($player);
        if ($tournamentID === null) {
            return;
        }

        foreach ($this->tournamentPlayers[$tournamentID] as $idx => $p) {
            if ($p && $p->userID === $player->userID) {
                $this->tournamentPlayers[$tournamentID][$idx] = null;
            }
        }
        if (isset($this->tournamentRoundWinners[$tournamentID])) {
            foreach ($this->tournamentRoundWinners[$tournamentID] as $round => $winners) {
                if (!is_array($winners)) continue;
                foreach ($winners as $matchIdx => $p) {
                    if ($p && $p->userID === $player->userID) {
                        $this->tournamentRoundWinners[$tournamentID][$round][$matchIdx] = null;
                    }
                }
            }
        }
        // cleanup when all players leave
        if ($this->isTournamentEmpty($tournamentID)) {
            unset($this->tournamentPlayers[$tournamentID]);
            unset($this->tournamentRoundWinners[$tournamentID]);
        }
    }

    public function cancelTournament(int $tournamentID, string $reason): void {
        $players = $this->tournamentPlayers[$tournamentID] ?? [];
        
        foreach ($players as $player) {
            if ($player === null) continue;
            
            $player->send([
                'type' => 'tournamentDC',
                'data' => ['message' => "Tournament cancelled: {$reason}"]
            ]);
        }
        
        // Cleanup
        unset($this->tournamentPlayers[$tournamentID]);
        unset($this->tournamentRoundWinners[$tournamentID]);
        unset($this->tournamentBrackets[$tournamentID]);
        unset($this->tournamentCurrentRound[$tournamentID]);
    }

    /*
     * Helpers
     */
    private function addRoundWinner(int $tournamentID, int $round, Player $winner): void {
        if (!isset($this->tournamentRoundWinners[$tournamentID][$round])) {
            $expectedWinners = $this->getExpectedWinnersForRound($round);
            $this->tournamentRoundWinners[$tournamentID][$round] = array_fill(0, $expectedWinners, null);
        }
        $matchIndex = $this->findMatchIndexForPlayer($tournamentID, $round, $winner);
        $this->tournamentRoundWinners[$tournamentID][$round][$matchIndex] = $winner;
    }

    private function findMatchIndexForPlayer(int $tournamentID, int $round, Player $player): int {
        if (!isset($this->tournamentBrackets[$tournamentID][$round])) {
            return 0;
        }
        $playerName = $player->username ?? "Player {$player->userID}";
        foreach ($this->tournamentBrackets[$tournamentID][$round] as $idx => $match) {
            if ($match['player1'] === $playerName || $match['player2'] === $playerName) {
                return $idx;
            }
        }
        return 0;
    }

    private function getExpectedWinnersForRound(int $round): int {
        // round 1: 4 winners, round 2: 2 winners, round 3: 1 winner
        return 8 / pow(2, $round);
    }

    public function getPlayerTournamentId(Player $player): ?int {
        foreach ($this->tournamentPlayers as $tournamentID => $players) {
            foreach ($players as $p) {
                if ($p !== null && $p->userID === $player->userID) {
                    return $tournamentID;
                }
            }
        }
        return null;
    }

    private function isTournamentEmpty(int $tournamentID): bool {
        if (!isset($this->tournamentPlayers[$tournamentID])) {
            return true;
        }
        foreach ($this->tournamentPlayers[$tournamentID] as $p) {
            if ($p !== null) {
                return false;
            }
        }
        return true;
    }

    public function getWaitingCount(): int {
        return count($this->waitingPlayers);
    }

	public function getWaitingPlayers(): array {
		return $this->waitingPlayers;
	}
	
    public function isPlayerWaiting(Player $player): bool {
        if (!isset($player->userID)) return false;

        foreach ($this->waitingPlayers as $p) {
            if ($p->userID === $player->userID) {
                return true;
            }
        }
        return false;
    }

    public function getTournamentPlayers(int $tournamentID): array {
        return $this->tournamentPlayers[$tournamentID] ?? [];
    }

    public static function shufflePlayers(array $players): array {
        shuffle($players);
        return self::getNextRoundPairs($players);
    }

    public static function getNextRoundPairs(array $players): array {
        $pairs = [];
        for ($i = 0; $i < count($players); $i += 2) {
            if (isset($players[$i + 1])) {
                $pairs[] = [$players[$i], $players[$i + 1]];
            } else {
                $pairs[] = [$players[$i]];
            }
        }
        return $pairs;
    }

    public static function getNumOfRounds(int $numPlayers): int {
        return (int) ceil(log($numPlayers, 2));
    }

    public function getCurrentRound(int $tournamentID): int {
        return $this->tournamentCurrentRound[$tournamentID] ?? 1;
    }
}