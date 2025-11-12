<?php

namespace src\Controllers;

use src\Database;
use src\Models\UserModels;
use src\http\Response;
use src\http\HttpStatusCode;

class AuthController
{
    private $userModel;

    public function __construct(Database $db)
    {
        $this->userModel = new UserModels($db);
    }

    public function sendTwoFactorCode()
    {
        // require a valid JWT (for tests redirect to /issue-jwt)
        $token = getJWTFromRequest();
        if (!$token) {
            header('Location: /issue-jwt');
            exit;
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            header('Location: /issue-jwt');
            exit;
        }

        $userId = (int) $payload['user_id'];

        $code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user = $this->userModel->findUserById($userId);
        $this->userModel->saveTwoFactorCode($userId, $code, $expiresAt);

        sendTwoFactorEmail($user['email'], $code);

        header('Location: /verify-2fa');
        exit;
    }

    public function verifyTwoFactorCode()
    {
        // require a valid JWT
        $token = getJWTFromRequest();
        if (!$token) {
            header('Location: /issue-jwt');
            exit;
        }
        $payload = verifyJWT($token);
        if (!$payload) {
            header('Location: /issue-jwt');
            exit;
        }

        $userId = (int) $payload['user_id'];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $code = $_POST['code'] ?? '';

            if ($this->userModel->verifyTwoFactorCode($userId, $code)) {
                // issue new JWT with 2FA flag
                $newToken = generateJWT($userId, true);
                setJWTCookie($newToken, 3600);

                header('Location: /dashboard');
                exit;
            } else {
                $error = 'Invalid or expired code';
            }
        }

        ob_start();
        require base_path('views/verify-2fa.view.php');
        $content = ob_get_clean();
        
        return new Response(HttpStatusCode::Ok, $content);
    }
}