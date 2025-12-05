<?php 

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\TournamentsModel;

class TournamentController 
{
	private $tournaments;

	public function __construct(Database $db) 
	{
		$this->tournaments = new TournamentsModel($db);
	}

	public function getTournamentByName(Request $request, $parameters): Response
	{
		$name = $parameters['name'] ?? null;
		if ($name === null || !is_string($name)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
		}
		$tournament = $this->tournaments->getTournamentByName($name);
		if ($tournament === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$tournament) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $tournament, ['Content-Type' => 'application/json']);

	}

	public function getTournament(Request $request, $parameters): Response 
	{
		$id = $parameters['id'] ?? null;
		if (!ctype_digit($id))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
		$id = (int) $id;
		$tournament = $this->tournaments->getTournamentById($id);
		if ($tournament === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$tournament) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $tournament, ['Content-Type' => 'application/json']);
	}

	public function getTournaments(Request $request, $parameters): Response 
	{
		$allTournaments = $this->tournaments->getAllTournaments();
		if ($allTournaments === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $allTournaments, ['Content-Type' => 'application/json']);
	}

	public function newTournament(Request $request, $parameters): Response 
	{
		
		$name = $request->postParams['name'] ?? null;
		if ($name == null || !is_string($name))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);	

		$id = $this->tournaments->createTournament($name);
		if ($id === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"]);
		}
		return new Response(HttpStatusCode::Ok, $id, ['Content-Type' => 'application/json']);
	}

	public function endTournament(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);	
		}
		$tournament = $this->tournaments->getTournamentById($id);
		if ($tournament['finished_at'] !== null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input Tournament finished already"], ['Content-Type' => 'application/json']);	
		}
		$finishedTour = $this->tournaments->endTournament($id);
		if ($finishedTour === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"]);
		} elseif (!$finishedTour) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $finishedTour, ['Content-Type' => 'application/json']);
	}

	// 	Update name
	// Start tournament
	// Delete tournament
}