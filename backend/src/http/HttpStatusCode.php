<?php

namespace src\http;

enum HttpStatusCode: int
{
	case Ok = 200;
	case Created = 201;
	case NoContent = 204;
	case BadRequest = 400;
	case Unauthorised = 401;
	case Forbidden = 403;
	case NotFound = 404;
	case Conflict = 409;
	case LargeHeaders = 431;
	case InternalServerError = 500;

	// match:
	// self: HttpStatusCode
	public function message(): string
	{
		return match ($this) {
			self::Ok => 'Success',
			self::Created => 'Resource Created',
			self::Unauthorised => 'Unauthorised',
			self::BadRequest => 'Bad Request',
			self::Forbidden => 'Forbbiden Request',
			self::Conflict => 'Conflict',
			self::LargeHeaders => 'Request Header Fields too Large',
			self::InternalServerError => 'Internal Server Error',

		};
	}
}