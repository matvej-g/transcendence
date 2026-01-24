<?php

namespace src\http;

use src\Database;
use src\Logger;
use src\middleware\LoggingMiddleware;
use src\middleware\MiddlewareDispatcher;

class Kernel
{
	private Router $router;
	private Database $db;
	private MiddlewareDispatcher $middleware;

	public function __construct()
	{
		$this->db = new Database('sqlite:' . base_path('/database/transcendence.db'));
		$this->router = new Router();
		
		$logger = new Logger();
        $loggingMiddleware = new LoggingMiddleware($logger);
        $this->middleware = new MiddlewareDispatcher($loggingMiddleware);
	}

	public function handle(Request $request): Response
	{	
		require base_path('src/http/routes.php');

		if ($request->postParams === null) {
    		return new Response(HttpStatusCode::BadRequest, ["error" => "Invalid JSON body"], ['Content-Type' => 'application/json']);
		}

		$uri = parse_url($request->getUri())['path'];		
		$method = $request->getMethod();
		$response = $this->middleware->handler($request, fn($req) => $this->router->route($uri, $method, $request, $this->db));

		return $response;
	}
}