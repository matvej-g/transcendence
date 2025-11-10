<?php

namespace src\http;

class Response 
{


	// look up ?string
	public function __construct(
		private HttpStatusCode $status,
		private string $content = '',
		private array $headers = []
	)
	{
	}

	public function getStatusCodeValue(): int
	{
		return $this->status->value;
	}

	public function send(): void
	{
		http_response_code($this->status->value);

		echo $this->content;
	}
}