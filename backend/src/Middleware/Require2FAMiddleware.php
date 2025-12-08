<?php

namespace src\Middleware;

use src\http\Request;
use src\http\Response;
use src\http\HttpStatusCode;

class Require2FAMiddleware
{
    /**
     * Check if user has completed 2FA verification
     */
    public static function handle(Request $request): ?Response
    {
        // First check basic auth
        $authCheck = AuthMiddleware::requireAuth($request);
        if ($authCheck !== null) {
            return $authCheck;
        }

        // Check if 2FA is verified
        if (empty($request->user['two_factor_verified'])) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => '2FA verification required']),
                ['Content-Type' => 'application/json']
            );
        }

        return null; // null = continue to controller
    }
}
