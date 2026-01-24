<?php

namespace src\http;

class Request
{
	// User data from JWT (set by AuthMiddleware)
	public ?array $user = null;


	public function __construct(
		public readonly array $getParams,
		public readonly ?array $postParams,
		public readonly array $cookies,
		public readonly array $files,
		public readonly array $server
	)
	{
	}

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
				$post = null;
			}
			else
				$post = $decoded;
		}

		return new static($get, $post, $cookies, $files, $server);
	}

	public function getUri(): string
	{
		return $this->server['REQUEST_URI'] ?? '/';
	}

	public function getMethod(): string
	{
		if (is_array($this->postParams) && isset($this->postParams['_method'])) {
			return strtoupper((string) $this->postParams['_method']);
		}
		return $this->server['REQUEST_METHOD'];
	}
}
