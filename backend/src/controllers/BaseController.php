<?php

namespace src\controllers;

use src\http\Response;
use src\http\HttpStatusCode;

abstract class BaseController
{
    protected function jsonResponse(mixed $data, HttpStatusCode $status = HttpStatusCode::Ok): Response
    {
        return new Response($status, $data, ['Content-Type' => 'application/json']);
    }

    protected function jsonSuccess(mixed $data): Response
    {
        return $this->jsonResponse($data, HttpStatusCode::Ok);
    }

    protected function jsonCreated(mixed $data): Response
    {
        return $this->jsonResponse($data, HttpStatusCode::Created);
    }

    protected function jsonBadRequest(string $message): Response
    {
        return $this->jsonResponse(['error' => $message], HttpStatusCode::BadRequest);
    }

    protected function jsonNotFound(string $message = 'Not Found'): Response
    {
        return $this->jsonResponse(['error' => $message], HttpStatusCode::NotFound);
    }

    protected function jsonServerError(string $message = 'Database error'): Response
    {
        return $this->jsonResponse(['error' => $message], HttpStatusCode::InternalServerError);
    }

    protected function jsonConflict(string $message): Response
    {
        return $this->jsonResponse(['error' => $message], HttpStatusCode::Conflict);
    }

    protected function jsonUnauthorized(string $message = 'Unauthorised'): Response
    {
        return $this->jsonResponse(['error' => $message], HttpStatusCode::Unauthorised);
    }
}
