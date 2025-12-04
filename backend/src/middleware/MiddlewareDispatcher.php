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

	// when aadding more middleware this can be updated to be more flexible
	public function handler(Request $request, callable $nextFunc): Response
	{
		$requestId = $this->logging->handleRequest($request);

		// calls router maybe needs exception handling
		$response = $nextFunc($request);

		$this->logging->handleResponse($response, $requestId);

		return $response;
	}
}