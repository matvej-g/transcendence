<?php

namespace src\http;

use src\Database;

class Kernel
{

	private Router $router;
	private Database $db;

	public function __construct()
	{
		// not sure about constducting them every time
		$this->db = new Database('sqlite:' . base_path('/database/transcendence.db'));
		$this->router = new Router();
	}

	public function handle(Request $request): Response
	{		
		// extract the value without query string from url under key path
		$uri = parse_url($request->getUri())['path'];		
		
		$method = $request->getMethod();

		require base_path('src/http/routes.php');
		return ($this->router->route($uri, $method, $request, $this->db));
	}
}