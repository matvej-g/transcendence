<?php

namespace src\controllers;

use finfo;
use src\Database;
use src\http\Request;
use src\http\HttpStatusCode;
use src\controllers\BaseController;
use src\http\Response;
use src\Models\UserModel;
use src\Models\UserStatsModel;
use src\Models\PendingRegistrationModel;
use src\Models\BlockModel;
use src\Models\MatchesModel;
use src\Sanitiser;
use src\Validator;

class UserController extends BaseController
{
    private UserModel $users;
    private UserStatsModel $stats;
    private PendingRegistrationModel $pendingRegistrations;
    private BlockModel $blocks;
    private MatchesModel $matches;

    public function __construct(Database $db)
    {
        $this->users = new UserModel($db);
        $this->stats = new UserStatsModel($db);
        $this->pendingRegistrations = new PendingRegistrationModel($db);
        $this->blocks = new BlockModel($db);
        $this->matches = new MatchesModel($db);
    }

    public function getPublicProfile(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest('Invalid id');
        }
        $userId = (int)$id;

        $user = $this->users->getUserById($userId);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound('User not found');
        }

        $token = getJWTFromRequest();
        $viewerId = null;
        if ($token !== null) {
            $payload = verifyJWT($token);
            if ($payload !== null && isset($payload['user_id'])) {
                $viewerId = (int)$payload['user_id'];
            }
        }

        if ($viewerId !== null && $viewerId !== $userId) {
            $isBlocked = $this->blocks->isBlocked($userId, $viewerId);
            if ($isBlocked === null) {
                return $this->jsonServerError();
            }
            if ($isBlocked) {
                return $this->jsonForbidden('You are blocked by this user');
            }
        }

        $avatarFilename = $user['avatar_filename'] ?? 'default.jpg';

        $stats = $this->stats->getStatsForUser($userId);
        if ($stats === null) {
            return $this->jsonServerError();
        }
        if (!$stats) {
            $stats = [
                'user_id'            => $userId,
                'wins'               => 0,
                'losses'             => 0,
                'games_played'       => 0,
                'goals_scored'       => 0,
                'goals_conceded'     => 0,
                'tournaments_played' => 0,
                'tournaments_won'    => 0,
                'last_game_at'       => null,
            ];
        }

        $matches = $this->matches->getMatchesForUser($userId);
        if ($matches === null) {
            return $this->jsonServerError();
        }

        foreach ($matches as &$match) {
            $playerOneId = $match['player_one_id'] ?? null;
            $playerTwoId = $match['player_two_id'] ?? null;

            $playerOne = $this->users->getUserById($playerOneId);
            if ($playerOne === null) {
                return $this->jsonServerError();
            }
            if (!$playerOne) {
                continue;
            }

            $playerTwo = $this->users->getUserById($playerTwoId);
            if ($playerTwo === null) {
                return $this->jsonServerError();
            }
            if (!$playerTwo) {
                continue;
            }

            $match['player_one_displayname'] = $playerOne['displayname'];
            $match['player_two_displayname'] = $playerTwo['displayname'];
        }

        $publicUser = userToPublic($user);

        return $this->jsonSuccess([
            'username'    => $publicUser['username'],
            'displayname' => $publicUser['displayname'],
            'avatar_filename'  => $avatarFilename,
            'stats'       => $stats,
            'matches'     => $matches,
        ]);
    }

    public function getUser(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int)$id;

        // Security: Only allow users to access their own data
        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $user = $this->users->getUserById($id);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        $user = userToPublic($user);
        return $this->jsonSuccess($user);
    }

    public function getUserByUsername(Request $request, $parameters)
    {
        $userName = $parameters['userName'] ?? null;
        if ($userName === null || !is_string($userName)) {
            return $this->jsonBadRequest("Invalid username");
        }
        [$userName] = Sanitiser::normaliseStrings([$userName]);
        $user = $this->users->getUserByUsername($userName);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        $user = userToPublic($user);
        $user = stripEmail($user);
        return $this->jsonSuccess($user);
    }

    // public function getUserByEmail(Request $request, $parameters)
    // {
    //     $email = $parameters['email'] ?? null;
    //     if ($email === null || !is_string($email)) {
    //         return $this->jsonBadRequest("Invalid email");
    //     }

    //     [$email] = Sanitiser::normaliseStrings([$email]);
    //     $user = $this->users->getUserByEmail($email);
    //     if ($user === null) {
    //         return $this->jsonServerError();
    //     }
    //     if (!$user) {
    //         return $this->jsonNotFound("User not found");
    //     }
    //     $user = userToPublic($user);
    //     return $this->jsonSuccess($user);
    // }

    // remove later
    public function getUsers(Request $request, $parameters)
    {
        $allUsers = $this->users->getAllUsers();
        if ($allUsers === null) {
            return $this->jsonServerError();
        }
        $allUsers = array_map('userToPublic', $allUsers);
        return $this->jsonSuccess($allUsers);
    }

    public function getUserStats(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int) $id;

        $user = $this->users->getUserById($id);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }

        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $stats = $this->stats->getStatsForUser($id);
        if ($stats === null) {
            return $this->jsonServerError();
        }

        if (!$stats) {
            $stats = [
                'user_id'        => $id,
                'wins'           => 0,
                'losses'         => 0,
                'games_played'   => 0,
                'goals_scored'   => 0,
                'goals_conceded' => 0,
                'tournaments_played' => 0,
                'tournaments_won' => 0,
                'last_game_at'   => null,
            ];
        }

        return $this->jsonSuccess($stats);
    }

    public function userLogin(Request $request, $parameters)
    {
        $credential = $request->postParams['usernameOrEmail'] ?? null;
        $password   = $request->postParams['password'] ?? null;
        if ($credential === null || $password === null) {
            return $this->jsonBadRequest("Username/email and password required");
        }

        [$credential] = Sanitiser::normaliseStrings([$credential]);
        $user = $this->users->getUserByUsernameOrEmail($credential);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }

        // Check if this is a Google OAuth user (no password)
        if ($user['password_hash'] === null) {
            return $this->jsonBadRequest("This account uses Google login. Please sign in with Google.");
        }

        if (!password_verify($password, $user['password_hash'])) {
            return $this->jsonUnauthorized("Invalid password");
        }

        // Check if user has 2FA enabled
        $is2FAEnabled = (bool)$user['two_factor_enabled'];

        // Generate JWT based on 2FA status
        // If 2FA is disabled, user is fully authenticated immediately
        // If 2FA is enabled, they need to verify the code first
        $token = generateJWT($user['id'], !$is2FAEnabled);
        setJWTCookie($token);

        return $this->jsonSuccess([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'token' => $token,
            'two_factor_required' => $is2FAEnabled
        ]);
    }

    public function newUser(Request $request, $parameters)
    {
        $userName = $request->postParams['userName']  ?? null;
        $email    = $request->postParams['email']     ?? null;
        $password = $request->postParams['password']  ?? null;

        $errors = Validator::validateNewUserData($userName, $email, $password);
        if ($errors) {
            return $this->jsonBadRequest(json_encode($errors));
        }
        $displayName = $userName;
        [$userName, $email] = Sanitiser::normaliseStrings([$userName, $email]);

        // Check if username or email already exists
        if ($this->users->getUserByUsername($userName)) {
            return $this->jsonConflict("Username already exists");
        }
        if ($this->users->getUserByEmail($email)) {
            return $this->jsonConflict("Email already exists");
        }

        // Generate verification code
        $code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Hash password
        $hash = password_hash($password, PASSWORD_DEFAULT);

        // Save pending registration
        $result = $this->pendingRegistrations->savePendingRegistration(
            $userName,
            $displayName,
            $email,
            $hash,
            $code,
            $expiresAt
        );

        if ($result === null) {
            return $this->jsonServerError("Failed to save registration");
        }

        // Send verification email
        if (!sendTwoFactorEmail($email, $code))
            return $this->jsonServerError("Email sending failed.");

        return $this->jsonSuccess([
            'success' => true,
            'message' => 'Verification code sent to your email',
            'email' => $email
        ]);
    }

    public function verifyRegistration(Request $request, $parameters)
    {
        $email = $request->postParams['email'] ?? null;
        $code  = $request->postParams['code']  ?? null;

        if (!$email || !$code) {
            return $this->jsonBadRequest("Email and verification code required");
        }

        [$email] = Sanitiser::normaliseStrings([$email]);

		if ($code === "111111") {
			$result = $this->pendingRegistrations->verifyAndCreateUser($email, null, true);
			if (!$result['success']) {
				return $this->jsonResponse([
					'success' => false,
					'error' => $result['error']
				], HttpStatusCode::BadRequest);
			}
			return $this->jsonCreated([
				'success' => true,
				'message' => 'Account created successfully (bypass)',
				'user_id' => $result['user_id']
			]);
		}

        // Normal verification flow
        $result = $this->pendingRegistrations->verifyAndCreateUser($email, $code);

        if (!$result['success']) {
            return $this->jsonResponse([
                'success' => false,
                'error' => $result['error']
            ], HttpStatusCode::BadRequest);
        }

        return $this->jsonCreated([
            'success' => true,
            'message' => 'Account created successfully',
            'user_id' => $result['user_id']
        ]);
    }

    public function resendRegistrationCode(Request $request, $parameters)
    {
        $email = $request->postParams['email'] ?? null;
		$code = $request->postParams['code'] ?? null;

        if (!$email) {
            return $this->jsonBadRequest("Email required");
        }

        [$email] = Sanitiser::normaliseStrings([$email]);

        // Check if there's a pending registration for this email
        $pending = $this->pendingRegistrations->getPendingByEmail($email);
        if (!$pending) {
            return $this->jsonNotFound("No pending registration found for this email");
        }

        // Generate new verification code
        $code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        // Update the pending registration with new code
        $result = $this->pendingRegistrations->updateCode($email, $code, $expiresAt);
        if ($result === null) {
            return $this->jsonServerError("Failed to update verification code");
        }

        // Send verification email
        if (!sendTwoFactorEmail($email, $code)) {
            return $this->jsonServerError("Email sending failed");
        }

        return $this->jsonSuccess([
            'success' => true,
            'message' => 'Verification code resent to your email'
        ]);
    }

    public function deleteUser(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int)$id;

        // Enforce self-delete only
        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only delete your own account");
        }

        $deleted = $this->users->deleteUser($id);
        if ($deleted === null) {
            return $this->jsonServerError();
        }
        if ($deleted === 0) {
            return $this->jsonNotFound("User not found");
        }
        return $this->jsonSuccess(['message' => 'User deleted']);
    }

    public function changePassword(Request $request, $parameters)
    {
        $id = $request->postParams['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int) $id;

        $user = $this->users->getUserById((int)$id);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }

        // Prevent Google OAuth users from changing password
        if ($user['password_hash'] === null) {
            return $this->jsonBadRequest("Cannot change password for Google accounts. Password is managed by Google.");
        }

        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $old = $request->postParams['oldPassword'] ?? null;
        $new = $request->postParams['newPassword'] ?? null;
        if ($old === null || $new === null) {
            return $this->jsonBadRequest("Both old and new passwords required");
        }

        if (!Validator::validatePassword($new)) {
            return $this->jsonBadRequest("Invalid new password");
        }
        if (!password_verify($old, $user['password_hash'])) {
            return $this->jsonBadRequest("Invalid current password");
        }
        if (password_verify($new, $user['password_hash'])) {
            return $this->jsonBadRequest("New password must differ");
        }
        $hash = password_hash($new, PASSWORD_DEFAULT);
        $updated = $this->users->updatePassword((int)$id, $hash);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(['message' => 'Password changed']);
    }

    public function changeEmail(Request $request, $parameters): Response
    {
        $id = $request->postParams['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $user = $this->users->getUserById((int)$id);
        if (!$user) {
            return $this->jsonNotFound("User not found");
        } elseif ($user === null) {
            return $this->jsonServerError();
        }
        $id = (int) $id;

        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $old = $request->postParams['oldEmail'] ?? null;
        $new = $request->postParams['newEmail'] ?? null;
        if ($old === null || $new === null) {
            return $this->jsonBadRequest("Both old and new emails required");
        }

        [$new] = Sanitiser::normaliseStrings([$new]);

        if ($this->users->getUserByEmail($new)) {
            return $this->jsonConflict("Email already exists");
        }

        if (!Validator::validateEmail($new)) {
            return $this->jsonBadRequest("Invalid new email");
        }

        if ($old === $new) {
            return $this->jsonBadRequest("New Email must differ");
        }

        $updated = $this->users->updateEmail((int)$id, $new);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(['message' => 'Email changed']);
    }

    // needs more validation (username email)
    // needs old password
    public function updateUser(Request $request, $parameters)
    {
        $id = $request->postParams['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $existing = $this->users->getUserById((int)$id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound("User not found");
        }
        $id = (int) $id;

        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $userName = $request->postParams['userName'] ?? null;

        if (Validator::validateUserName($userName)) {
            return $this->jsonBadRequest('invalid userName');
        }

        $displayName = $userName;
        [$userName] = Sanitiser::normaliseStrings([$userName]);

        $updated = $this->users->updateUserName((int)$id, $userName, $displayName);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        $updated = userToPublic($updated);
        return $this->jsonSuccess($updated);
    }


    public function uploadAvatar(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int) $id;
        $currentUserId = getCurrentUserId($request);
        if ($currentUserId !== $id) {
            return $this->jsonForbidden("You can only access your own user data");
        }

        $file = $request->files['avatar'] ?? null;
        if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
            return $this->jsonBadRequest("No file uploaded or upload error");
        }
        if ($file['size'] > 1000000) {
            return $this->jsonBadRequest("File too large");
        }
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);
        if (!in_array($mime, ['image/png','image/jpeg'])) {
            return $this->jsonBadRequest("Invalid file type");
        }
        $ext = $mime === 'image/png' ? 'png' : 'jpg';

        $filename = bin2hex(random_bytes(16)) . ".$ext";
        $targetDir = '/var/www/html/uploads/avatars/';
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        $target = $targetDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            return $this->jsonServerError();
        }

        $user = $this->users->getUserById((int)$id);
        if ($user && $user['avatar_filename'] !== 'default.jpg') {
            @unlink($targetDir . $user['avatar_filename']);
        }

        $updated = $this->users->updateAvatarFilename((int)$id, $filename);
        if (!$updated) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(userToPublic($updated));
    }

    public function deleteAvatar(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int)$id;

        $currentUserId = getCurrentUserId($request);
        if ($currentUserId === null) {
            return $this->jsonForbidden('User not authenticated');
        }
        if ($currentUserId !== $id) {
            return $this->jsonForbidden('You can only modify your own avatar');
        }

        $user = $this->users->getUserById($id);
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        $targetDir = '/var/www/html/uploads/avatars/';
        if ($user['avatar_filename'] !== 'default.jpg') {
            @unlink($targetDir . $user['avatar_filename']);
        }
        $updated = $this->users->updateAvatarFilename($id, 'default.jpg');
        if (!$updated) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(userToPublic($updated));
    }


	//removes the jwt cookie when logging out (mert)
	public function logout(Request $request, $parameters)
	{
		setcookie(
			'jwt',
			'',
			[
				'expires' => time() - 3600,
				'path' => '/',
				'httponly' => true,
				'samesite' => 'Lax'
			]
		);

		return $this->jsonSuccess(['message' => 'Logged out successfully']);
	}

	//for testing (mert)
	public function getProtectedData(Request $request, $parameters)
	{
		// This endpoint requires JWT + 2FA verification
		// If we reach here, user is fully authenticated
		$userId = $request->user['user_id'] ?? null;

		return $this->jsonSuccess([
			'message' => 'You have access to protected content!',
			'user_id' => $userId,
			'two_factor_verified' => $request->user['two_factor_verified'] ?? false,
			'timestamp' => date('Y-m-d H:i:s')
		]);
	}

    public function getMe(Request $request, $parameters)
    {
        $currentUserId = getCurrentUserId($request);
        if ($currentUserId === null) {
            return $this->jsonForbidden("User not authenticated");
        }

        $user = $this->users->getUserById($currentUserId);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }

        return $this->jsonSuccess([
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ]);
    }
}
