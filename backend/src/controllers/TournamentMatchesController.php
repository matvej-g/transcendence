<?php

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\TournamentMatchesModel;

class TournamentMatchesController
{
    private TournamentMatchesModel $tournamentMatches;

    public function __construct(Database $db)
    {
        $this->tournamentMatches = new TournamentMatchesModel($db);
    }

    public function getTournamentMatch(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $id = (int) $id;
        $record = $this->tournamentMatches->getTournamentMatchById($id);
        if ($record === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif (!$record) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $record, ['Content-Type' => 'application/json']);
    }

    public function getTournamentMatches(Request $request, $parameters): Response
    {
        $all = $this->tournamentMatches->getAllTournamentMatches();
        if ($all === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $all, ['Content-Type' => 'application/json']);
    }

    public function newTournamentMatch(Request $request, $parameters): Response
    {
        $tournamentId = $request->postParams['tournamentId'] ?? null;
        $matchId = $request->postParams['matchId'] ?? null;
        if ($tournamentId === null || $matchId === null || !ctype_digit((string)$tournamentId) || !ctype_digit((string)$matchId)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = (int) $tournamentId;
        $matchId = (int) $matchId;
        $id = $this->tournamentMatches->createTournamentMatch($tournamentId, $matchId);
        if ($id === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Created, ["id" => $id], ['Content-Type' => 'application/json']);
    }

    public function updateTournamentMatch(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $id = (int) $id;
        $existing = $this->tournamentMatches->getTournamentMatchById($id);
        if ($existing === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif (!$existing) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = $request->postParams['tournamentId'] ?? $existing['tournament_id'];
        $matchId = $request->postParams['matchId'] ?? $existing['match_id'];
        if (!ctype_digit((string)$tournamentId) || !ctype_digit((string)$matchId)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $tournamentId = (int) $tournamentId;
        $matchId = (int) $matchId;
        $updated = $this->tournamentMatches->updateTournamentMatch($id, $tournamentId, $matchId);
        if (!$updated) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, $updated, ['Content-Type' => 'application/json']);
    }

    public function deleteTournamentMatch(Request $request, $parameters): Response
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
        }
        $deleted = $this->tournamentMatches->deleteTournamentMatch((int)$id);
        if ($deleted === null) {
            return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
        } elseif ($deleted === 0) {
            return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
        }
        return new Response(HttpStatusCode::Ok, ["message" => "Record deleted successfully"], ['Content-Type' => 'application/json']);
    }
}
