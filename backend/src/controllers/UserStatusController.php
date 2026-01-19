<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\Models\UserStatusModel;
use src\Validator;

class UserStatusController extends BaseController
{
    private UserStatusModel $status;

    public function __construct(Database $db)
    {
        $this->status = new UserStatusModel($db);
    }

    // Mirrors MessagingController; replace with real auth later.
    private function getCurrentUserId(Request $request): ?int
    {
        $server = $request->server;
        $headerId = $server['HTTP_X_USER_ID'] ?? null;
        if ($headerId !== null && Validator::validateId($headerId)) {
            return (int) $headerId;
        }

        $candidate = $request->postParams['currentUserId']
            ?? $request->getParams['currentUserId']
            ?? null;

        if ($candidate !== null && Validator::validateId($candidate)) {
            return (int) $candidate;
        }

        return null;
    }

    public function getStatus(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid id');
        }
        $id = (int) $id;

        $row = $this->status->getStatusByUserId($id);
        if ($row === null) {
            return $this->jsonServerError();
        }

        if (!$row) {
            $row = [
                'user_id'        => $id,
                'online'         => 0,
                'last_seen'      => null,
                // 'current_match_id' => null,
            ];
        }

        return $this->jsonSuccess($row);
    }

    public function setOnline(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $row = $this->status->setOnline($userId);
        if ($row === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess($row);
    }

    public function setOffline(Request $request, $parameters)
    {
        $userId = $this->getCurrentUserId($request);
        if ($userId === null) {
            return $this->jsonBadRequest('Missing or invalid current user id');
        }

        $row = $this->status->setOffline($userId);
        if ($row === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess($row);
    }
}
