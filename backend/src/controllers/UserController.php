<?php

namespace src\controllers;

use src\Database;
use src\http\HttpStatusCode;
use src\http\Request;
use src\http\Response;
use src\Models\UserModel;
use src\Validator;

class UserController {

	private UserModel $users;

	public function __construct(Database $db)
	{
		$this->users = new UserModel($db);
	}

	public function getUser(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $id is not a valid id"], ['Content-Type' => 'application/json']);
		}
		$id = (int) $id; 
		$user = $this->users->getUserById($id);
		if ($user === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		elseif (!$user) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $user, ['Content-Type' => 'application/json']);
	}

	// need to adapt regex for this but can test by changing order in routes
	public function getUserbyUsername(Request $request, $parameters): Response
	{
		$userName = $parameters['userName'] ?? null;
		if ($userName === null || !is_string($userName)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $userName is not a valid username"], ['Content-Type' => 'application/json']);
		}
		$user = $this->users->getUserbyUsername($userName);
		if ($user === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		elseif (!$user) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $user, ['Content-Type' => 'application/json']);
	}

	// for this to work email needs to be unqiue in database
	public function getUserbyEmail(Request $request, $parameters): Response
	{
		$email = $parameters['email'] ?? null;
		if ($email === null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $email is not a valid email"], ['Content-Type' => 'application/json']);
		}
		$user = $this->users->getUserbyEmail($email);
		if ($user === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		elseif (!$user) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $user, ['Content-Type' => 'application/json']);
	}

	// returns all users or empty array
	public function getUsers(Request $request, $parameters): Response
	{
		$allUsers = $this->users->getAllUsers();
		if ($allUsers === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $allUsers, ['Content-Type' => 'application/json']);
	}

	// currently searching by email won't work because it's not unique
	public function userLogin(Request $request, $parameters): Response
	{
		$usernameOrEmail = $request->postParams['usernameOrEmail'] ?? null;
		$password = $request->postParams['password'] ?? null;
		if ($password === null || $usernameOrEmail === null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input - Username, Email or Password missing"], ['Content-Type' => 'application/json']);
		}

		$user = $this->users->getUserByUsernameOrEmail($usernameOrEmail);
		if ($user === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		if (!$user) {
			return new Response(HttpStatusCode::NotFound, ['error' => "User not Found"], ['Content-Type' => 'application/json']);
		}
		if (!password_verify($password, $user['password_hash'])) {
			return new Response(HttpStatusCode::Unauthorised, ['error' => 'invalid password'], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $user, ['Content-Type' => 'application/json']);
	}

	public function newUser(Request $request, $parameters): Response
	{
		$userName = $request->postParams['userName'] ?? null;
		$email = $request->postParams['email'] ?? null;
		$password = $request->postParams['password'] ?? null;

		// change back once email is sent and unique
		if ($email === null) {
			$email = "hard@code.de";
		}

		$errors = Validator::validateNewUserData($userName, $email, $password);
		if ($errors) {
			return new Response(HttpStatusCode::BadRequest, ['errors' => $errors], ['Content-Type' => 'application/json']);	
		}

		$hash = password_hash($password, PASSWORD_DEFAULT);	
		$body = $this->users->createUser($userName, $email, $hash);
		if (!$body) {
			return new Response(HttpStatusCode::Conflict, ["error" => "conflicting unique user info"], ['Content-Type' => 'application/json']);	
		}
		return new Response(HttpStatusCode::Created, $body, ['Content-Type' => 'application/json']);
	}

	public function deleteUser(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $id is not a valid id"], ['Content-Type' => 'application/json']);
		}

        $deletedRows = $this->users->deleteUser($id);
		if (!$deletedRows) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		elseif ($deletedRows === 0) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not found"], ['Content-Type' => 'application/json']);
		}

		return new Response(HttpStatusCode::Ok,["message" => "User deleted successfully"], ['Content-Type' => 'application/json']);
	}

	// could also modify so that you can either get the user by id or by username
	public function changePassword(Request $request, $parameters): Response
	{
		$id = $request->postParams['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $id is not a valid id"], ['Content-Type' => 'application/json']);
		}

		$user = $this->users->getUserById($id);
		if ($user === null) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		elseif (!$user) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}

		$oldPassword = $request->postParams['oldPassword'] ?? null;
		if ($oldPassword === null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input require current password"], ['Content-Type' => 'application/json']);
		}
		if (!password_verify($oldPassword, $user['password_hash'])) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input invalid current password"], ['Content-Type' => 'application/json']);
		}

		$newPassword = $request->postParams['newPassword'] ?? null;
		if ($newPassword === null) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input require new password"], ['Content-Type' => 'application/json']);
		}

		if (password_verify($newPassword, $user['password_hash'])) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input new password musst differ from current one"], ['Content-Type' => 'application/json']);
		}
		else {
			$hash = password_hash($newPassword, PASSWORD_DEFAULT);
		}
		$updatedUser = $this->users->updatePassword($id, $hash);
		if (!$updatedUser) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, ["message" => "Password updated successfully"], ['Content-Type' => 'application/json']);

	}

	public function updateUser(Request $request, $parameters): Response 
	{
		$id = $request->postParams['id'] ?? null;
		if ($id === null || !ctype_digit($id)) {
			return new Response(HttpStatusCode::BadRequest, ["error" => "Bad Input $id is not a valid id"], ['Content-Type' => 'application/json']);
		}

		$user = $this->users->getUserById($id);
		if (!$user) {
			return new Response(HttpStatusCode::NotFound, ["error" => "User not Found"], ['Content-Type' => 'application/json']);
		}
		elseif (!$user) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}

		$userName = $request->postParams['userName'] ?? $user['username'];
		$email = $request->postParams['email'] ?? $user['email'];
		$password = $request->postParams['password'] ?? null;
		
		$errors = Validator::validateUpdateUserData($userName, $email, $password);
		if ($errors) {
			return new Response(HttpStatusCode::BadRequest, ['errors' => $errors], ['Content-Type' => 'application/json']);
		}
		
		if ($password !== null) {
			$hash = password_hash($password, PASSWORD_DEFAULT);
		} else {
			$hash = $user['password_hash'];
		}
		// authenticate its the own user or admin
		$newUser = $this->users->updateUserInfo($id, $userName, $email, $hash);
		if (!$newUser) {
			return new Response(HttpStatusCode::InternalServerError, ["error" => "Database error"], ['Content-Type' => 'application/json']);
		}
		return new Response(HttpStatusCode::Ok, $newUser, ['Content-Type' => 'application/json']);
	}
}
