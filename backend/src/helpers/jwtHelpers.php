<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * NOTE: In production store secret in env / vault. This file uses getenv fallback.
 */
const JWT_ALGO = 'HS256';

$__jwt_secret = getenv('JWT_SECRET') ?: 'change_this_super_secret';
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', $__jwt_secret);
}

/**
 * Generate a JWT.
 */
function generateJWT(int $userId, bool $twoFactorVerified = false, int $ttl = 3600): string
{
    $issuedAt = time();
    $payload = [
        'iat' => $issuedAt,
        'exp' => $issuedAt + $ttl,
        'user_id' => $userId,
        'two_factor_verified' => $twoFactorVerified,
    ];

    return JWT::encode($payload, JWT_SECRET, JWT_ALGO);
}

/**
 * Verify and decode a JWT. Returns array payload or null.
 */
function verifyJWT(string $token): ?array
{
    try {
        $decoded = JWT::decode($token, new Key(JWT_SECRET, JWT_ALGO));
        return (array) $decoded;
    } catch (Throwable $e) {
        error_log('JWT verify failed: ' . $e->getMessage());
        return null;
    }
}

/**
 * Get JWT from Authorization header (Bearer) or jwt cookie.
 */
function getJWTFromRequest(): ?string
{
    // Authorization header (case-insensitive)
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    foreach ($headers as $k => $v) {
        if (strtolower($k) === 'authorization') {
            if (preg_match('/Bearer\s+(.*)$/i', $v, $m)) {
                return $m[1];
            }
        }
    }

    // Cookie fallback
    return $_COOKIE['jwt'] ?? null;
}

/**
 * Set JWT cookie (helper).
 */
function setJWTCookie(string $token, int $ttl = 3600): void
{
    // TODO: Change to true when deploying to production with HTTPS
    setcookie('jwt', $token, [
        'expires' => time() + $ttl,
        'path' => '/',
        'secure' => false,   // Development: allows HTTP. Production: must be true (HTTPS)
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}