<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\TournamentsModel;
use src\Models\TournamentPlayerModel;
use src\Models\TournamentMatchesModel;
use src\Models\MatchesModel;
use src\Services\TournamentService;
use src\Models\UserStatsModel;
use src\Validator;

class TournamentController extends BaseController
{
    private TournamentsModel $tournaments;
    private TournamentPlayerModel $playersModel;
    private TournamentService $tournamentService;
    private UserStatsModel $userStats;

    public function __construct(Database $db)
    {
        $this->tournaments = new TournamentsModel($db);
        $this->playersModel = new TournamentPlayerModel($db);
        $tmModel           = new TournamentMatchesModel($db);
        $matchesModel      = new MatchesModel($db);
        $this->tournamentService = new TournamentService($this->playersModel, $tmModel, $matchesModel);
        $this->userStats = new UserStatsModel($db);
    }

    public function getTournamentByName(Request $request, $parameters)
    {
        $name = $parameters['name'] ?? null;
        if (!is_string($name) || !Validator::validateTournamentName($name)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $tournament = $this->tournaments->getTournamentByName($name);
        if ($tournament === null) {
            return $this->jsonServerError();
        }
        if (!$tournament) {
            return $this->jsonNotFound('Tournament not found');
        }
        return $this->jsonSuccess($tournament);
    }

    public function getTournament(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $tournament = $this->tournaments->getTournamentById($id);
        if ($tournament === null) {
            return $this->jsonServerError();
        }
        if (!$tournament) {
            return $this->jsonNotFound('Tournament not found');
        }
        return $this->jsonSuccess($tournament);
    }

    public function getTournaments(Request $request, $parameters)
    {
        $all = $this->tournaments->getAllTournaments();
        if ($all === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($all);
    }

    public function newTournament(Request $request, $parameters)
    {
        $name = $request->postParams['name'] ?? null;
        if (!is_string($name) || !Validator::validateTournamentName($name)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = $this->tournaments->createTournament($name);
        if ($id === null) {
            return $this->jsonServerError();
        }
        return $this->jsonCreated(['id' => $id]);
    }

    public function endTournament(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $tournament = $this->tournaments->getTournamentById($id);
        if ($tournament === null) {
            return $this->jsonServerError();
        }
        if (!$tournament) {
            return $this->jsonNotFound('Tournament not found');
        }
        if ($tournament['finished_at'] !== null) {
            return $this->jsonBadRequest('Tournament already finished');
        }

        // optional winnerId in request body
        $winnerRaw = $request->postParams['winnerId'] ?? null;
        $winnerId = null;
        if ($winnerRaw !== null) {
            if (!Validator::validateId($winnerRaw)) {
                return $this->jsonBadRequest('Invalid winner id');
            }
            $winnerId = (int) $winnerRaw;
        }

        $updated = $this->tournaments->endTournament($id, $winnerId);
        if ($updated === null) {
            return $this->jsonServerError();
        }

        // gather participants for stats update
        $allPlayers = $this->playersModel->getAllTournamentPlayers();
        if ($allPlayers === null) {
            // don't block the response on stats failure
            return $this->jsonSuccess($updated);
        }
        $participantIds = [];
        foreach ($allPlayers as $p) {
            if ((int)$p['tournament_id'] === $id) {
                $participantIds[] = (int)$p['user_id'];
            }
        }

        // update aggregated stats, ignore failures
        $this->userStats->recordTournamentResult($participantIds, $winnerId);

        return $this->jsonSuccess($updated);
    }

    /**
     * POST /api/tournament/{id}/generate-matches
     * Generates initial round matches for the tournament.
     */
    public function generateMatches(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int) $id;

        $tournament = $this->tournaments->getTournamentById($id);
        if ($tournament === null) {
            return $this->jsonServerError();
        }
        if (!$tournament) {
            return $this->jsonNotFound('Tournament not found');
        }

        $ok = $this->tournamentService->generateInitialMatches($id);
        if ($ok === false) {
            return $this->jsonServerError('Failed to generate matches');
        }

        return $this->jsonSuccess(['message' => 'Tournament matches generated']);
    }

    /**
     * GET /api/tournament/{id}/next-match
     * Returns the next unfinished match (with match details) for this tournament.
     */
    public function getNextMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int) $id;

        $tournament = $this->tournaments->getTournamentById($id);
        if ($tournament === null) {
            return $this->jsonServerError();
        }
        if (!$tournament) {
            return $this->jsonNotFound('Tournament not found');
        }

        $row = $this->tournamentService->getNextMatch($id);
        if ($row === null) {
            return $this->jsonServerError();
        }
        if ($row === []) {
            return $this->jsonNotFound('No upcoming matches');
        }

        return $this->jsonSuccess($row);
    }
}
