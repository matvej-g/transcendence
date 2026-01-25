<?php

namespace src\http;

use src\Database;

class Kernel
{
	private Router $router;
	private Database $db;

	public function __construct()
	{
		$this->db = new Database('sqlite:' . base_path('/database/transcendence.db'));
		$this->router = new Router();
	}

	public function handle(Request $request): Response
	{	
		require base_path('src/http/routes.php');

		if ($request->postParams === null) {
    		return new Response(HttpStatusCode::BadRequest, ["error" => "Invalid JSON body"], ['Content-Type' => 'application/json']);
		}

		$uri = parse_url($request->getUri())['path'];		
		$method = $request->getMethod();

		return $this->router->route($uri, $method, $request, $this->db);
	}
}