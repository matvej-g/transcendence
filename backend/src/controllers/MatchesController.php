<?php 

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\UserModel;
use src\Models\MatchesModel;

class MatchesController{

	private MatchesModel $matches;
	private UserModel $users;

	public function __construct(Database $db)
	{
		$this->matches = new MatchesModel($db);
		$this->users = new UserModel($db);
	}

	public function getMatch(Request $request, $parameters): Response {
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
		}
		$id = (int) $id;
		$match = $this->matches->getMatchById($id);
		if ($match === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$match) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $match, ['Content-Type' => 'application/json']);
	}



	// gets information concerning all Matches in Database
	// if empty still returns 200 and empty array
	public function getMatches(Request $request, $parameters): Response {
		$allMatches = $this->matches->getAllMatches();
		if ($allMatches === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $allMatches, ['Content-Type' => 'application/json']);
	}

	// add player cannot play against themselves
	public function newMatch(Request $request, $parameters): Response {
		// array keys could be different later
		$playerOneId = $request->postParams['idPlayerOne'] ?? null;
		$playerTwoId = $request->postParams['idPlayerTwo'] ?? null;
		
		if ($playerOneId === null || $playerTwoId === null || !ctype_digit((string)$playerOneId) || !ctype_digit((string)$playerTwoId))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input not a valid user id"], ['Content-Type' => 'application/json']);	
		
		$playerOneId = (int)$playerOneId;
		$playerTwoId = (int)$playerTwoId;

		$userOne = $this->users->getUserById($playerOneId);
		if ($userOne === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$userOne) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}

		$userTwo =$this->users->getUserById($playerTwoId);
		if ($userTwo === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$userTwo) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}

		$id = $this->matches->createMatch($playerOneId, $playerTwoId);
		if ($id === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"]);
		}
		return new Response(HttpStatusCode::Created, ["id" => (int)$id], ['Content-Type' => 'application/json']);
	}

	// patch
	public function updateScore(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input not a match user id"], ['Content-Type' => 'application/json']);	
		}

		$match = $this->matches->getMatchById($id);
		if ($match === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$match) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Match not Found"], ['Content-Type' => 'application/json']);
		}

		if ($match['finished_at'] !== null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Match has already finished"], ['Content-Type' => 'application/json']);	
		} 

		$scorePlayerOne = $request->postParams['scorePlayerOne'] ?? null;
		$scorePlayerTwo = $request->postParams['scorePlayerTwo'] ?? null;
		if ($scorePlayerOne === null || $scorePlayerTwo === null || !ctype_digit($scorePlayerOne) || !ctype_digit($scorePlayerTwo)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Score is not a valid value"], ['Content-Type' => 'application/json']);	
		}
		$scorePlayerOne = (int)$scorePlayerOne;
		$scorePlayerTwo = (int)$scorePlayerTwo;
		if ($scorePlayerOne < 0 || $scorePlayerTwo < 0 || $scorePlayerOne < $match['score_player_one'] || $scorePlayerTwo < $match['score_player_two']) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "New score must be greater than or equal to current score and non-negative"], ['Content-Type' => 'application/json']);	
		}

		$updatedMatch = $this->matches->updateScore($id, $scorePlayerOne, $scorePlayerTwo);
		if (!$updatedMatch) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $updatedMatch, ['Content-Type' => 'application/json']);
	}

	// post
	public function endMatch(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input not a valid match id"], ['Content-Type' => 'application/json']);	
		}

		$match = $this->matches->getMatchById($id);
		if ($match === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		} elseif (!$match) {
			return new Response(HttpStatusCode::NotFound, ["error" => "Match not Found with id $id"], ['Content-Type' => 'application/json']);
		}

		if ($match['finished_at'] !== null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Match has already finished"], ['Content-Type' => 'application/json']);	
		}

		// handle even score? 
		$winnerId = null;
		if ($match['score_player_one'] > $match['score_player_two']) {
			$winnerId = $match['player_one_id'];
		} elseif ($match['score_player_one'] < $match['score_player_two']) {
			$winnerId = $match['player_two_id'];
		} else {
			$winnerId = 0;
		}

		$finishedMatch = $this->matches->endMatch($id, $winnerId);
		if (!$finishedMatch) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $finishedMatch, ['Content-Type' => 'application/json']);
	}

	// delete
	public function deleteMatch()
	{
		
	}
}
