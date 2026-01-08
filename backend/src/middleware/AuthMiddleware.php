<?php

namespace src\middleware;

use src\http\Request;
use src\http\Response;
use src\http\HttpStatusCode;

class AuthMiddleware
{
    /**
     * Main middleware handler - checks basic authentication
     */
    public static function handle(Request $request): ?Response
    {
        return self::requireAuth($request);
    }

    /**
     * Check if user has a valid JWT token
     */
    public static function requireAuth(Request $request): ?Response
    {
        $token = getJWTFromRequest();
        
        if (!$token) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'Authentication required']),
                ['Content-Type' => 'application/json']
            );
        }

        $payload = verifyJWT($token);
        
        if (!$payload) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'Invalid or expired token']),
                ['Content-Type' => 'application/json']
            );
        }

        // Attach user info to request for use in controllers
        $request->user = $payload;
        
        return null; // null = continue to controller
    }

    /**
     * Get current authenticated user from request
     */
    public static function getUser(Request $request): ?array
    {
        return $request->user ?? null;
    }
}
