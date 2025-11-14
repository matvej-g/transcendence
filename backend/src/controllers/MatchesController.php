<?php 

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\MatchesModel;

class MatchesController{

	private MatchesModel $matches;

	public function __construct(Database $db)
	{
			$this->matches = new MatchesModel($db);
	}

	// gets information concerning all Matches in Database
	// if empty still returns 200 and empty array
	public function getMatches(Request $request, $parameters): Response {
		$allMatches = $this->matches->getAllMatches();
		return new Response(HttpStatusCode::Ok, $allMatches, ['contentType' => 'json']);
	}

	// extracts id
	// checks if it's an int
	// runs query
	// checks if empty
	public function getMatch(Request $request, $parameters): Response {
		$id = $parameters['id'] ?? null;
		if (!ctype_digit($id))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['contentType' => 'json']);
		$id = (int) $id;
		$body = $this->matches->getMatchById($id);
		if (!$body)
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['contentType' => 'json']);
		return new Response(HttpStatusCode::Ok, $body, ['contentType' => 'json']);
	}

	public function newMatch(Request $request, $parameters): Response {
		// array keys could be different later
		$playerOneId = $request->postParams['player_one_id'] ?? null;
		$playerTwoId = $request->postParams['player_two_id'] ?? null;
		
		if (!is_int($playerOneId) || !is_int($playerTwoId))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['contentType' => 'json']);	
		// check if inside users table
			// if bad data return 400
		$id = $this->matches->createMatch($playerOneId, $playerTwoId);
		return new Response(HttpStatusCode::Ok, $id, ['contentType' => 'json']);
	}

	public function endMatch() {

	}
}
