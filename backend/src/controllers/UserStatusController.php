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

    private function getCurrentUserId(Request $request): ?int
    {
        $jwtUserId = getJwtUserId($request);
        if ($jwtUserId === null) {
            return null;
        }

        $server = $request->server;
        $headerId = $server['HTTP_X_USER_ID'] ?? null;

        $candidate = $request->postParams['currentUserId']
            ?? $request->getParams['currentUserId']
            ?? null;

        $providedId = null;
        if ($headerId !== null && Validator::validateId($headerId)) {
            $providedId = (int)$headerId;
        } elseif ($candidate !== null && Validator::validateId($candidate)) {
            $providedId = (int)$candidate;
        }

        if ($providedId !== null && $providedId !== $jwtUserId) {
            return null;
        }

        return $jwtUserId;
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
                'current_match_id' => null,
                'busy' => 0,
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
