<?php

namespace src\Services;

use src\Models\TournamentPlayerModel;
use src\Models\TournamentMatchesModel;
use src\Models\MatchesModel;
use src\Validator;

class TournamentService
{
    public function __construct(
        private TournamentPlayerModel $tournamentPlayers,
        private TournamentMatchesModel $tournamentMatches,
        private MatchesModel $matches
    ) {
    }

    /**
     * Generate initial bracket (round 1) for a tournament.
     *
     * Pairs players in the order they are found in tournament_players.
     * If odd number of players: last one gets a bye (no match created yet).
     */
    public function generateInitialMatches(int $tournamentId): bool
    {
        $players = $this->getPlayersForTournament($tournamentId);
        if ($players === null) {
            return false;
        }

        if (count($players) < 2) {
            // nothing to generate
            return true;
        }

        $matchIndex = 0;
        for ($i = 0; $i + 1 < count($players); $i += 2) {
            $p1 = (int) $players[$i]['user_id'];
            $p2 = (int) $players[$i + 1]['user_id'];

            $matchId = $this->matches->createMatch($p1, $p2);
            if ($matchId === null) {
                return false;
            }

            $tmId = $this->tournamentMatches->createTournamentMatchWithRound($tournamentId, (int) $matchId, 1, $matchIndex);
            if ($tmId === null) {
                return false;
            }

            $matchIndex++;
        }

        // If odd number of players, one player advances automatically (bye). Handling of
        // byes and further rounds can be implemented later if needed.
        return true;
    }

    /**
     * Return the next unfinished match for a tournament, including match details.
     */
    public function getNextMatch(int $tournamentId): ?array
    {
        $row = $this->tournamentMatches->getNextUnfinishedMatchForTournament($tournamentId);
        if ($row === null) {
            return null;
        }
        if ($row === []) {
            return [];
        }
        return $row;
    }

    private function getPlayersForTournament(int $tournamentId): ?array
    {
        // There is no direct method to get players by tournament in TournamentPlayerModel,
        // so for now we fetch all and filter here. Consider adding a dedicated query later.
        $all = $this->tournamentPlayers->getAllTournamentPlayers();
        if ($all === null) {
            return null;
        }

        $players = [];
        foreach ($all as $row) {
            if ((int) $row['tournament_id'] === $tournamentId) {
                $players[] = $row;
            }
        }

        return $players;
    }
}
