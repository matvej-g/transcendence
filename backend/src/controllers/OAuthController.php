<?php

namespace src\controllers;

use src\Database;
use src\Models\UserModel;
use src\http\Request;

class OAuthController extends BaseController
{
    private $userModel;
    private $googleClient;

    public function __construct(Database $db)
    {
        $this->userModel = new UserModel($db);
        
        // Initialize Google Client with environment variables
        $this->googleClient = new \Google_Client();
        $this->googleClient->setClientId($_ENV['GOOGLE_CLIENT_ID']);
        $this->googleClient->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
        $this->googleClient->setRedirectUri($_ENV['GOOGLE_REDIRECT_URI']);
        $this->googleClient->addScope("email");
        $this->googleClient->addScope("profile");
    }

    public function redirectToGoogle(Request $request, $parameters)
    {
        $authUrl = $this->googleClient->createAuthUrl();
        header('Location: ' . $authUrl);
        exit;
    }

    public function handleGoogleCallback(Request $request, $parameters)
    {
        $code = $request->getParams['code'] ?? null;
        
        if (!$code) {
            return $this->jsonBadRequest('No authorization code received from Google');
        }

        try {
            $token = $this->googleClient->fetchAccessTokenWithAuthCode($code);
            
            if (isset($token['error'])) {
                return $this->jsonBadRequest('Failed to get access token: ' . $token['error']);
            }

            $this->googleClient->setAccessToken($token);
            
            $google_oauth = new \Google_Service_Oauth2($this->googleClient);
            $google_account_info = $google_oauth->userinfo->get();
            
            $googleId = $google_account_info->id;
            $email = $google_account_info->email;
            $name = $google_account_info->name;

            $user = $this->userModel->getUserByGoogleId($googleId);
            
            if (!$user) {
                $existingUser = $this->userModel->getUserByEmail($email);
                if ($existingUser) {
                    return $this->jsonConflict('Email already registered with password login. Please use password to sign in.');
                }

                $username = $this->generateUniqueUsername($name, $email);
                $displayName = $name;
                
                $user = $this->userModel->createGoogleUser($username, $displayName, $email, $googleId);
                
                if (!$user) {
                    return $this->jsonServerError();
                }
            }
            
            // Generate JWT token (skip 2FA for OAuth users)
            $token = generateJWT($user['id'], true);
            setJWTCookie($token);
            
            // Remove sensitive data before sending to frontend
            $user = userToPublic($user);
            
            return $this->jsonSuccess([
                'success' => true,
                'user' => $user,
                'token' => $token
            ]);
            
        } catch (\Exception $e) {
            error_log("Google OAuth error: " . $e->getMessage());
            return $this->jsonServerError();
        }
    }

    private function generateUniqueUsername($name, $email)
    {
        // Try to create username from name first
        $baseUsername = strtolower(str_replace(' ', '_', $name));
        $baseUsername = preg_replace('/[^a-z0-9_]/', '', $baseUsername);
        
        // If name doesn't work, use email prefix
        if (empty($baseUsername)) {
            $baseUsername = explode('@', $email)[0];
            $baseUsername = preg_replace('/[^a-z0-9_]/', '', strtolower($baseUsername));
        }
        
        // Check if username exists, if so add numbers
        $username = $baseUsername;
        $counter = 1;
        while ($this->userModel->getUserByUsername($username)) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        return $username;
    }
}
