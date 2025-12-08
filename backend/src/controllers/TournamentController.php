<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\TournamentsModel;

class TournamentController extends BaseController
{
    private TournamentsModel $tournaments;

    public function __construct(Database $db)
    {
        $this->tournaments = new TournamentsModel($db);
    }

    public function getTournamentByName(Request $request, $parameters)
    {
        $name = $parameters['name'] ?? null;
        if ($name === null || !is_string($name)) {
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
        if ($id === null || !ctype_digit($id)) {
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
        if ($name === null || !is_string($name)) {
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
        if ($id === null || !ctype_digit($id)) {
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
        $updated = $this->tournaments->endTournament($id);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($updated);
    }
}
