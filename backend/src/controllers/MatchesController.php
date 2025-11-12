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
	public function getAllMatches(Request $request, $parameters): Response {
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

	// need to look into post
	public function newMatch(Request $request, $parameters): Response {
		// extract player id from parameters
		if (!ctype_digit('1') || !ctype_digit('a'))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['contentType' => 'json']);	
		// check if integers
		// check if inside users table
			// if bad data return 400
		// change parameters to extracted ids
		$id = $this->matches->createMatch('1', '2');
		return new Response(HttpStatusCode::Ok, $id, ['contentType' => 'json']);
	}

	public function endMatch() {

	}
}
