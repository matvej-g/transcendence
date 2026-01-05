<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\TournamentPlayerModel;
use src\Validator;

class TournamentPlayerController extends BaseController
{
    private TournamentPlayerModel $tournamentPlayers;

    public function __construct(Database $db)
    {
        $this->tournamentPlayers = new TournamentPlayerModel($db);
    }

    public function getTournamentPlayer(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $record = $this->tournamentPlayers->getTournamentPlayerById($id);
        if ($record === null) {
            return $this->jsonServerError();
        }
        if (!$record) {
            return $this->jsonNotFound('Record not found');
        }
        return $this->jsonSuccess($record);
    }

    public function getTournamentPlayers(Request $request, $parameters)
    {
        $all = $this->tournamentPlayers->getAllTournamentPlayers();
        if ($all === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($all);
    }

    // check if tournament has not finished yet ?
    public function newTournamentPlayer(Request $request, $parameters)
    {
        $tournamentId = $parameters['id'] ?? null;
        $userId = $request->postParams['userId'] ?? null;
        if (!Validator::validateId($tournamentId) || !Validator::validateId($userId)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $tournamentId = (int)$tournamentId;
        $userId = (int)$userId;

        $isPlayer = $this->tournamentPlayers->isTournamentPlayer($tournamentId, $userId);
        if ($isPlayer) {
            return $this->jsonBadRequest('Player is already participating');
        } else if ($isPlayer === null) {
            return $this->jsonServerError();
        }

        $playerCount = $this->tournamentPlayers->countTournamentPlayers($tournamentId);
        if ($playerCount > 8) {
            return $this->jsonBadRequest('Maximum amount of players is 8');
        } else if ($isPlayer === null) {
            return $this->jsonServerError();
        }

        $id = $this->tournamentPlayers->createTournamentPlayer($tournamentId, $userId);
        if ($id === null) {
            return $this->jsonServerError();
        }
        return $this->jsonCreated(['id' => $id]);
    }

    public function updateTournamentPlayer(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $id = (int)$id;
        $existing = $this->tournamentPlayers->getTournamentPlayerById($id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound('Record not found');
        }
        $tournamentId = $request->postParams['tournamentId'] ?? $existing['tournament_id'];
        $userId = $request->postParams['userId'] ?? $existing['user_id'];
        if (!Validator::validateId($tournamentId) || !Validator::validateId($userId)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $tournamentId = (int)$tournamentId;
        $userId = (int)$userId;
        $updated = $this->tournamentPlayers->updateTournamentPlayer($id, $tournamentId, $userId);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($updated);
    }

    public function deleteTournamentPlayer(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Bad Input');
        }
        $deleted = $this->tournamentPlayers->deleteTournamentPlayer((int)$id);
        if ($deleted === null) {
            return $this->jsonServerError();
        }
        if ($deleted === 0) {
            return $this->jsonNotFound('Record not found');
        }
        return $this->jsonSuccess(['message' => 'Record deleted successfully']);
    }
}
