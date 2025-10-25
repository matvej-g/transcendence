<?php

namespace src\http;

class Request
{
	// making sure that the variables reflect the current stage of the request and cannot be changed anymore
	// global variables could still be changed at this point
	public function __construct(		public readonly array $getParams,
		public readonly array $postParams,
		public readonly array $cookies,
		public readonly array $files,
		public readonly array $server)
	{

	}


	public static function createFromGlobals(): static
	{
		return new static($_GET, $_POST, $_COOKIE, $_FILES, $_SERVER);
	}

	// return the left side if it exists otherwise return right side
	public function getUri(): string
	{
		return ($this->server['REQUEST_URI'] ?? '/');
	}
}