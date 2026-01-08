<?php

namespace src\middleware;

use src\http\Request;
use src\http\Response;
use src\http\HttpStatusCode;
use src\Models\UserModel;
use src\Database;

class Require2FAMiddleware
{
    /**
     * Check if user has completed 2FA verification (only if 2FA is enabled)
     */
    public static function handle(Request $request): ?Response
    {
        // First check basic auth
        $authCheck = AuthMiddleware::requireAuth($request);
        if ($authCheck !== null) {
            return $authCheck;
        }

        $userId = $request->user['user_id'] ?? null;
        if (!$userId) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'Invalid user session']),
                ['Content-Type' => 'application/json']
            );
        }

        // Check if user has 2FA enabled in database
        $dsn = 'sqlite:' . BASE_PATH . '/database/transcendence.db';
        $db = new Database($dsn);
        $userModel = new UserModel($db);
        $is2FAEnabled = $userModel->is2FAEnabled($userId);

        // If 2FA is enabled, check if it's verified
        if ($is2FAEnabled && empty($request->user['two_factor_verified'])) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => '2FA verification required']),
                ['Content-Type' => 'application/json']
            );
        }

        return null; // null = continue to controller
    }
}

