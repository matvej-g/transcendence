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

    /**
     * Step 1: Redirect user to Google's OAuth consent screen
     * Frontend calls this endpoint, receives Google auth URL, then redirects user
     */
    public function redirectToGoogle(Request $request, $parameters)
    {
        $authUrl = $this->googleClient->createAuthUrl();
        return $this->jsonSuccess(['url' => $authUrl]);
    }

    /**
     * Step 2: Handle callback from Google after user authorizes
     * Google redirects user back to this endpoint with an authorization code
     * We exchange code for user info, then create/login the user
     */
    public function handleGoogleCallback(Request $request, $parameters)
    {
        $code = $request->getParams['code'] ?? null;
        
        if (!$code) {
            return $this->jsonBadRequest('No authorization code received from Google');
        }

        try {
            // Exchange authorization code for access token
            $token = $this->googleClient->fetchAccessTokenWithAuthCode($code);
            
            if (isset($token['error'])) {
                return $this->jsonBadRequest('Failed to get access token: ' . $token['error']);
            }

            $this->googleClient->setAccessToken($token);
            
            // Get user info from Google
            $google_oauth = new \Google_Service_Oauth2($this->googleClient);
            $google_account_info = $google_oauth->userinfo->get();
            
            $googleId = $google_account_info->id;
            $email = $google_account_info->email;
            $name = $google_account_info->name;
            
            // Check if user already exists
            $user = $this->userModel->getUserByGoogleId($googleId);
            
            if (!$user) {
                // Check if email is already used by a local account
                $existingUser = $this->userModel->getUserByEmail($email);
                if ($existingUser) {
                    return $this->jsonConflict('Email already registered with password login. Please use password to sign in.');
                }
                
                // Create new Google user
                // Generate a unique username from email or name
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
            $user = user_to_public($user);
            
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

    /**
     * Generate a unique username from Google account info
     * Handles collisions by appending numbers
     */
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
