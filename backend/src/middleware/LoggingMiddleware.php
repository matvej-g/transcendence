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


	private function sanitise_data($Params)
	{
		$newParams = is_array($Params) ? $Params : [];
		$sensitiveKeys = ['username', 'displayname', 'password', 'oldPassword', 'newPassword', 'token', 'access_token', 'refresh_token', 'email', 'oauth_id', 'two_factor_code'];
		foreach ($sensitiveKeys as $key) {
			if (array_key_exists($key, $newParams)) {
				$newParams[$key] = '***';
			}
		}
		return $newParams;
	}

	public function handleRequest(Request $request): string
	{
		$requestId = uniqid('');

		// Redact sensitive fields before logging to avoid leaking passwords/tokens
		$params = $this->sanitise_data($request->postParams);

		$this->logger->info('Incoming request', [
			'request_id' => $requestId,
			'method' => $request->getMethod(),
			'uri' => $request->getUri(),
			'params' => $params,
	    	'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
		]);
		return $requestId;
	}

	public function handleResponse(Response $response, $requestId): void
	{
		$params = $this->sanitise_data($response->getContent());

		$context = [
			'request_id' => $requestId,
			'status' => $response->getStatusCodeValue(),
        	'Content' => $params,
			'Header' => $response->getHeaders(),
		];
		if ($response->getStatusCodeValue() >= 400 ){
			$this->logger->error('Response', $context);
		} else {
			$this->logger->info('Response', $context);
		}
	}
}
