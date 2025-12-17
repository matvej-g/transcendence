<?php

namespace src\http;

class Response 
{


	// look up ?string
	public function __construct(
		private HttpStatusCode $status,
		private mixed $content = '',
		private array $headers = []
	)
	{
	}

	public function getStatusCodeValue(): int
	{
		return $this->status->value;
	}

	public function getContent(): mixed
	{
		return $this->content;
	}

	public function getHeaders(): array
	{
		return $this->headers;
	}

	public function send(): void
	{
		http_response_code($this->status->value);

		// handle encoding here like json encode base on header type
		if (($this->headers['Content-Type'] ?? '') === 'application/json')
			echo json_encode($this->content);
		else
			echo $this->content;
	}
}