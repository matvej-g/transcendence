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

	public function registerUser(Request $request,): Response
	{
		dump($request->getParams);
		$name = $request->getParams['name'] ?? null;
		$email = $request->getParams['email'] ?? null;
		$password = $request->getParams['password'] ?? null;
		dump($name);
		dump($email);
		if (Validator::validateString($name, 1, 15))
			dump("valid username");
		else
			dump("invalid username");
		if (Validator::validateEmail($email))
			dump("valid email");
		else
			dump("invalid email");
		if (Validator::validateString($password, 3, 15))
		{
			$hash = password_hash($password, PASSWORD_DEFAULT);
			dump($hash);
			if (password_verify($password, $hash))
				dump("password was hashed");
			else
				dump("password was not hashed");
			$body = $this->users->createUser($name, $email, $hash);
		}
		else
			dump("invalid password");
		return new Response(
			HttpStatusCode::Ok,
			json_encode($body),
		);
	}

	public function getUsers(Request $request): Response
	{
		$id = $request->getParams['id'] ?? null;

		if (!$id)
			$body = $this->users->showAllUsers();
		else
			$body = $this->users->findUserById($id);
		
		return new Response(
			HttpStatusCode::Ok,
			json_encode($body),
		);
	}

	public function getUser(Request $request, $parameters): Response
	{
		$id = $parameters['id'] ?? null;
		dump($id);
		if (!$id)
			return new Response(HttpStatusCode::BadRequest, json_encode(''));
		else 
			$body = $this->users->findUserById($id);
		dump($body);
		if (!$body)
			return new Response(HttpStatusCode::NotFound, json_encode($body));	
		return new Response(HttpStatusCode::Ok, json_encode($body));
	}
}
