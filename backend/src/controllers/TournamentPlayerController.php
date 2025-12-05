<?php

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\TournamentPlayerModel;

class TournamentPlayerController
{
    private TournamentPlayerModel $tournamentPlayers;

    public function __construct(Database $db)
    {
        $this->tournamentPlayers = new TournamentPlayerModel($db);
    }

    public function getTournamentPlayer(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $id = (int) $id;
        $record = $this->tournamentPlayers->getTournamentPlayerById($id);
        if ($record === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif (!$record) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $record, ['Content-Type' => 'application/json']);
    }

    public function getTournamentPlayers(Request $request, $parameters): Response
    {
        $all = $this->tournamentPlayers->getAllTournamentPlayers();
        if ($all === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $all, ['Content-Type' => 'application/json']);
    }

    public function newTournamentPlayer(Request $request, $parameters): Response
    {
        $tournamentId = $request->postParams['tournamentId'] ?? null;
        $userId = $request->postParams['userId'] ?? null;
        if ($tournamentId === null || $userId === null || !ctype_digit((string)$tournamentId) || !ctype_digit((string)$userId)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = (int) $tournamentId;
        $userId = (int) $userId;
        $id = $this->tournamentPlayers->createTournamentPlayer($tournamentId, $userId);
        if ($id === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Created, ["id" => $id], ['Content-Type' => 'application/json']);
    }

    public function updateTournamentPlayer(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $id = (int) $id;
        $existing = $this->tournamentPlayers->getTournamentPlayerById($id);
        if ($existing === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif (!$existing) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = $request->postParams['tournamentId'] ?? $existing['tournament_id'];
        $userId = $request->postParams['userId'] ?? $existing['user_id'];
        if (!ctype_digit((string)$tournamentId) || !ctype_digit((string)$userId)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = (int) $tournamentId;
        $userId = (int) $userId;
        $updated = $this->tournamentPlayers->updateTournamentPlayer($id, $tournamentId, $userId);
        if (!$updated) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $updated, ['Content-Type' => 'application/json']);
    }

    public function deleteTournamentPlayer(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $deleted = $this->tournamentPlayers->deleteTournamentPlayer((int)$id);
        if ($deleted === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif ($deleted === 0) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, ["message" => "Record deleted successfully"], ['Content-Type' => 'application/json']);
    }
}
