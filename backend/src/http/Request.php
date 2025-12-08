<?php

namespace src\http;

class Request
{
	// User data from JWT (set by AuthMiddleware)
	public ?array $user = null;

	// making sure that the variables reflect the current stage of the request and cannot be changed anymore
	// global variables could still be changed at this point
	public function __construct(		public readonly array $getParams,
		public readonly array $postParams,
		public readonly array $cookies,
		public readonly array $files,
		public readonly array $server)
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
				// if an input should be null still pass an empty array for $post
				$post = [];
				json_last_error_msg();
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
		return $postParams['_method'] ?? $this->server['REQUEST_METHOD'];
	}
}