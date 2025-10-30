<?php

namespace src\http;

enum HttpStatusCode: int
{
	case Ok = 200;
	case Created = 201;
	case BadRequest = 400;
	case Forbidden = 403;
	case LargeHeaders = 431;
	case InternalServerError = 500;

	// match:
	// self: HttpStatusCode
	public function message(): string
	{
		return match ($this) {
			self::Ok => 'Success',
			self::Created => 'Resource Created',
			self::BadRequest => 'Bad Request',
			self::Forbidden => 'Forbbiden Request',
			self::LargeHeaders => 'Request Header Fields too Large',
			self::InternalServerError => 'Internal Server Error',
		};
	}
}