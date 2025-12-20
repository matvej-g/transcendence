<?php

namespace src\middleware;

use src\http\Request;
use src\http\Response;
use src\Logger;

class LoggingMiddleware {
	private Logger $logger;

    public function __construct(Logger $logger)
    {
        $this->logger = $logger;
    }

	public function handleRequest(Request $request): string
	{
		$requestId = uniqid('');

		$this->logger->info('Incoming request', [
			'request_id' => $requestId,
			'method' => $request->getMethod(),
			'uri' => $request->getUri(),
			'params' => $request->postParams,
        	'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
		]);
		return $requestId;
	}

	public function handleResponse(Response $response, $requestId): void
	{
		$context = [
			'request_id' => $requestId,
			'status' => $response->getStatusCodeValue(),
        	'Content' => $response->getContent(),
			'Header' => $response->getHeaders(),
		];
		if ($response->getStatusCodeValue() >= 400 ){
			$this->logger->error('Response', $context);
		} else {
			$this->logger->info('Response', $context);
		}
	}
}