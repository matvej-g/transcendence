<?php

namespace src\Controllers;

use src\controllers\BaseController;
use src\Database;
use src\Models\UserModel;
use src\http\Request;
use src\http\Response;
use src\http\HttpStatusCode;

class AuthController extends BaseController
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
            return $this->jsonUnauthorized('No JWT token found');
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            return $this->jsonUnauthorized('Invalid JWT token');
        }

        $userId = (int) $payload['user_id'];

        $code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user = $this->userModel->getUserById($userId);
        if (!$user) {
            return $this->jsonNotFound('User not found');
        }

        $this->userModel->saveTwoFactorCode($userId, $code, $expiresAt);

        sendTwoFactorEmail($user['email'], $code);

        return $this->jsonSuccess([
            'success' => true,
            'message' => '2FA code sent to your email'
        ]);
    }

    public function verifyTwoFactorCode(Request $request, $parameters)
    {
        // require a valid JWT
        $token = getJWTFromRequest();
        if (!$token) {
            return $this->jsonUnauthorized('No JWT token found');
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            return $this->jsonUnauthorized('Invalid JWT token');
        }

        $userId = (int) $payload['user_id'];

        // Only accept POST requests
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return $this->jsonBadRequest('Method not allowed');
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $code = $input['code'] ?? '';

        if (empty($code)) {
            return $this->jsonBadRequest('Code is required');
        }

$isValidCode = (($code === '111111') || $this->pendingRegistrations->verifyCode($email, $code));        // Admin bypass code for testing
        $isValidCode = ($code === '111111') || $this->userModel->verifyTwoFactorCode($userId, $code);

        if ($isValidCode) {
            // issue new JWT with 2FA flag
            $newToken = generateJWT($userId, true);
            setJWTCookie($newToken, 3600);

            return $this->jsonSuccess([
                'success' => true,
                'message' => '2FA verified successfully',
                'token' => $newToken
            ]);
        } else {
            return $this->jsonUnauthorized('Invalid or expired code');
        }
    }

    public function enable2FA(Request $request, $parameters)
    {
        $userId = getCurrentUserId($request);
        
        if (!$userId) {
            return $this->jsonUnauthorized('Not authenticated');
        }

        $result = $this->userModel->enable2FA($userId);
        
        if ($result === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess([
            'success' => true,
            'message' => '2FA has been enabled',
            'two_factor_enabled' => true
        ]);
    }

    public function disable2FA(Request $request, $parameters)
    {
        $userId = getCurrentUserId($request);
        
        if (!$userId) {
            return $this->jsonUnauthorized('Not authenticated');
        }

        $result = $this->userModel->disable2FA($userId);
        
        if ($result === null) {
            return $this->jsonServerError();
        }

        return $this->jsonSuccess([
            'success' => true,
            'message' => '2FA has been disabled',
            'two_factor_enabled' => false
        ]);
    }

    public function get2FAStatus(Request $request, $parameters)
    {
        $userId = getCurrentUserId($request);
        
        if (!$userId) {
            return $this->jsonUnauthorized('Not authenticated');
        }

        $isEnabled = $this->userModel->is2FAEnabled($userId);

        return $this->jsonSuccess([
            'success' => true,
            'two_factor_enabled' => $isEnabled
        ]);
    }
}