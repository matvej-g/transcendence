<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\TournamentMatchesModel;
use src\Validator;

class TournamentMatchesController extends BaseController
{
    private TournamentMatchesModel $tournamentMatches;

    public function __construct(Database $db)
    {
        $this->tournamentMatches = new TournamentMatchesModel($db);
    }

    public function getTournamentMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $record = $this->tournamentMatches->getTournamentMatchById($id);
        if ($record === null) {
            return $this->jsonServerError();
        }
        if (!$record) {
            return $this->jsonNotFound('Record not found');
        }
        return $this->jsonSuccess($record);
    }

    public function getTournamentMatches(Request $request, $parameters)
    {
        $all = $this->tournamentMatches->getAllTournamentMatches();
        if ($all === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($all);
    }

    public function newTournamentMatch(Request $request, $parameters)
    {
        $tournamentId = $request->postParams['tournamentId'] ?? null;
        $matchId = $request->postParams['matchId'] ?? null;
        if (!Validator::validateId($tournamentId) || !Validator::validateId($matchId)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $tournamentId = (int)$tournamentId;
        $matchId = (int)$matchId;
        $id = $this->tournamentMatches->createTournamentMatch($tournamentId, $matchId);
        if ($id === null) {
            return $this->jsonServerError();
        }
        return $this->jsonCreated(['id' => $id]);
    }

    public function updateTournamentMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $existing = $this->tournamentMatches->getTournamentMatchById($id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound('Record not found');
        }
        $tournamentId = $request->postParams['tournamentId'] ?? $existing['tournament_id'];
        $matchId = $request->postParams['matchId'] ?? $existing['match_id'];
        if (!Validator::validateId($tournamentId) || !Validator::validateId($matchId)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $tournamentId = (int)$tournamentId;
        $matchId = (int)$matchId;
        $updated = $this->tournamentMatches->updateTournamentMatch($id, $tournamentId, $matchId);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($updated);
    }

    public function deleteTournamentMatch(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $deleted = $this->tournamentMatches->deleteTournamentMatch((int)$id);
        if ($deleted === null) {
            return $this->jsonServerError();
        }
        if ($deleted === 0) {
            return $this->jsonNotFound('Record not found');
        }
        return $this->jsonSuccess(['message' => 'Record deleted successfully']);
    }
}
