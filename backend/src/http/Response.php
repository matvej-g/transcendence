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

	public function send(): void
	{
		http_response_code($this->status->value);

		// handle encoding here like json encode base on header type
		if (($this->headers['contentType'] ?? '') === 'json')
			echo json_encode($this->content);
		else
			echo $this->content;
	}
}