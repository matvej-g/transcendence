<?php

namespace src\controllers;

use src\Database; // alias full namespace: makes it possible to use class name alone
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\UserModels;
use src\Validator;

class UserController {

	private UserModels $users;


	public function __construct(Database $db)
	{
		$this->users = new UserModels($db);
	}

	// need to update conflicting fields response
	// needs to be added in httpStatusCodes
	public function newUser(Request $request, $parameters): Response
	{
		$userName = $request->postParams['userName'] ?? null;
		$email = $request->postParams['email'] ?? null;
		$password = $request->postParams['password'] ?? null;

		$errors = Validator::validateNewUserData($userName, $email, $password);
		if ($errors)
			return new Response(HttpStatusCode::BadRequest, ['errors' => $errors], ['contentType' => 'json']);	

		$hash = password_hash($password, PASSWORD_DEFAULT);	
		$body = $this->users->createUser($userName, $email, $hash);
		if (!$body)
			return new Response(HttpStatusCode::BadRequest, ["error" => "conflicting unique user info"], ['contentType' => 'json']);	
		return new Response(HttpStatusCode::Created, $body, ['contentType' => 'json']);
		
			// get appropriate status code: Conflict
	}

	// returns all users or empty array
	public function getUsers(Request $request, $parameters): Response
	{
		$allUsers = $this->users->getAllUsers();
		return new Response(HttpStatusCode::Ok, $allUsers, ['contentType' => 'json']);
	}

	// gets individual user by id
	// if user is not in database $body is empty and 404 is sent
	public function getUser(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if (!ctype_digit($id))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['contentType' => 'json']);
		$id = (int) $id; 
		$body = $this->users->getUserById($id);
		if (!$body)
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['contentType' => 'json']);
		return new Response(HttpStatusCode::Ok, $body, ['contentType' => 'json']);
	}
}
