<?php

namespace src\middleware;

use src\http\Request;
use src\http\Response;

class MiddlewareDispatcher {
	
	private LoggingMiddleware $logging;

	public function __construct(LoggingMiddleware $logging)
	{
		$this->logging = $logging;
	}

	public function handler(Request $request, callable $nextFunc): Response
	{
		$requestId = $this->logging->handleRequest($request);

		$response = $nextFunc($request);

		$this->logging->handleResponse($response, $requestId);

		return $response;
	}
}