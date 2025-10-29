<?php

namespace src\controllers;

use src\Database; // alias full namespace: makes it possible to use class name alone
use src\http\Request;
use src\http\Response;
use src\Models\UserModels;

class UserController {

	private UserModels $users;


	public function __construct(Database $db)
	{
		$this->users = new UserModels($db);
	}

	public function showUsers(Request $request): Response
	{
		$id = $request->getParams['id'];
		dump($id);
		dump($request->getParams);
		
		// dump($this->users->createUser('John', 'johnny', 'john@john.de', 6));
		dump($this->users->findUserById($id));
		dump($this->users->showAllUsers());
		// dump(json_encode($this->users->showAllUsers()));
		
		return new Response(
			content: json_encode($this->users->showAllUsers()),
			status: 200,
			headers: ['' => ''],
		);
	}
}
