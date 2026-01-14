<?php

namespace src\http;

class Request
{
	// User data from JWT (set by AuthMiddleware)
	public ?array $user = null;

	// making sure that the variables reflect the current stage of the request and cannot be changed anymore
	// global variables could still be changed at this point
	public function __construct(
		public readonly array $getParams,
		// may be null when JSON body is invalid
		public readonly ?array $postParams,
		public readonly array $cookies,
		public readonly array $files,
		public readonly array $server
	)
	{
	}

	// creates from globals and checks if incoming request contains json
	public static function createFromGlobals(): static
	{
		$server = $_SERVER;
		$get = $_GET;
		$cookies = $_COOKIE;
		$files = $_FILES;
		$post = $_POST;

		$contentType = $server['CONTENT_TYPE'] ?? '';
		if (stripos($contentType, 'application/json') !== false) {
			$contents = file_get_contents('php://input');
			$decoded = json_decode($contents, associative: true);
			if (json_last_error() != JSON_ERROR_NONE) {
				// invalid JSON payload -> mark post params as null so Kernel can
				// return a proper 400 response
				$post = null;
			}
			else
				$post = $decoded;
		}

		return new static($get, $post, $cookies, $files, $server);
	}

	// return the left side if it exists otherwise return right side
	public function getUri(): string
	{
		return $this->server['REQUEST_URI'] ?? '/';
	}

	// returns the request method
	public function getMethod(): string
	{
		// Allow HTTP method override via hidden _method field (e.g. for PATCH/DELETE),
		// but only when postParams is an array and the key exists.
		if (is_array($this->postParams) && isset($this->postParams['_method'])) {
			return strtoupper((string) $this->postParams['_method']);
		}
		return $this->server['REQUEST_METHOD'];
	}
}
