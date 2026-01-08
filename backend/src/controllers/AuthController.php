<?php

namespace src\Controllers;

use src\Database;
use src\Models\UserModel;
use src\http\Request;
use src\http\Response;
use src\http\HttpStatusCode;

class AuthController
{
    private $userModel;

    public function __construct(Database $db)
    {
        $this->userModel = new UserModel($db);
    }

    public function sendTwoFactorCode(Request $request, $parameters)
    {
        // require a valid JWT
        $token = getJWTFromRequest();
        if (!$token) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'No JWT token found'])
            );
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'Invalid JWT token'])
            );
        }

        $userId = (int) $payload['user_id'];

        $code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            return new Response(
                HttpStatusCode::NotFound,
                json_encode(['success' => false, 'error' => 'User not found'])
            );
        }

        $this->userModel->saveTwoFactorCode($userId, $code, $expiresAt);

        sendTwoFactorEmail($user['email'], $code);

        return new Response(
            HttpStatusCode::Ok,
            json_encode([
                'success' => true,
                'message' => '2FA code sent to your email'
            ])
        );
    }

    public function verifyTwoFactorCode(Request $request, $parameters)
    {
        // require a valid JWT
        $token = getJWTFromRequest();
        if (!$token) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'No JWT token found'])
            );
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode(['success' => false, 'error' => 'Invalid JWT token'])
            );
        }

        $userId = (int) $payload['user_id'];

        // Only accept POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return new Response(
                HttpStatusCode::BadRequest,
                json_encode(['success' => false, 'error' => 'Method not allowed'])
            );
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? '';

        if (empty($code)) {
            return new Response(
                HttpStatusCode::BadRequest,
                json_encode(['success' => false, 'error' => 'Code is required'])
            );
        }

        if ($this->userModel->verifyTwoFactorCode($userId, $code)) {
            // issue new JWT with 2FA flag
            $newToken = generateJWT($userId, true);
            setJWTCookie($newToken, 3600);

            return new Response(
                HttpStatusCode::Ok,
                json_encode([
                    'success' => true,
                    'message' => '2FA verified successfully',
                    'token' => $newToken
                ])
            );
        } else {
            return new Response(
                HttpStatusCode::Unauthorised,
                json_encode([
                    'success' => false,
                    'error' => 'Invalid or expired code'
                ])
            );
        }
    }
}