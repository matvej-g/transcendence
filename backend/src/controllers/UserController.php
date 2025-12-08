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

	// for this to work needs updated router regex conversion logic
	public function getUserbyName(Request $request, $parameters): Response
	{
	}

	// currently searching by email won't work because it's not unique
	public function userLogin(Request $request, $parameters): Response
	{
		$usernameOrEmail = $request->postParams['usernameOrEmail'] ?? null;
		$password = $request->postParams['password'] ?? null;

		$user = $this->users->getUserByUsernameOrEmail($usernameOrEmail);
		if (!$user)
			return new Response(HttpStatusCode::BadRequest, ['error' => 'invalid Input'], ['Content-Type' => 'application/json']);
		if (!password_verify($password, $user['password_hash']))
			return new Response(HttpStatusCode::Unauthorised, ['error' => 'invalid password'], ['Content-Type' => 'application/json']);
		
		// Issue JWT with two_factor_verified=false
		$token = generateJWT($user['id'], false, 3600);
		setJWTCookie($token, 3600);
		
		return new Response(HttpStatusCode::Ok, [
			'success' => true,
			'user' => [
				'id' => $user['id'],
				'username' => $user['username'],
				'email' => $user['email']
			],
			'token' => $token
		], ['Content-Type' => 'application/json']);
	}

	public function newUser(Request $request, $parameters): Response
	{
		$userName = $request->postParams['userName'] ?? null;
		$email = $request->postParams['email'] ?? null;
		$password = $request->postParams['password'] ?? null;

		// change back once email is sent and unique
		if ($email === null)
			$email = "hard@code.de";

		$errors = Validator::validateNewUserData($userName, $email, $password);
		if ($errors)
			return new Response(HttpStatusCode::BadRequest, ['errors' => $errors], ['Content-Type' => 'application/json']);	

		$hash = password_hash($password, PASSWORD_DEFAULT);	
		$body = $this->users->createUser($userName, $email, $hash);
		if (!$body)
			return new Response(HttpStatusCode::Conflict, ["error" => "conflicting unique user info"], ['Content-Type' => 'application/json']);	
		return new Response(HttpStatusCode::Created, $body, ['Content-Type' => 'application/json']);
	}

	// returns all users or empty array
	public function getUsers(Request $request, $parameters): Response
	{
		$allUsers = $this->users->getAllUsers();
		return new Response(HttpStatusCode::Ok, $allUsers, ['Content-Type' => 'application/json']);
	}

	// gets individual user by id
	// if user is not in database $body is empty and 404 is sent
	public function getUser(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if (!ctype_digit($id))
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input"], ['Content-Type' => 'application/json']);
		$id = (int) $id; 
		$body = $this->users->getUserById($id);
		if (!$body)
			return new Response(HttpStatusCode::NotFound, ["error" => "Not Found"], ['Content-Type' => 'application/json']);
		return new Response(HttpStatusCode::Ok, $body, ['Content-Type' => 'application/json']);
	}
}
