<?php

namespace src\controllers;

use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\UserModel;
use src\Validator;

class UserController extends BaseController
{
    private UserModel $users;

    public function __construct(Database $db)
    {
        $this->users = new UserModel($db);
    }

    public function getUser(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $id = (int)$id;
        $user = $this->users->getUserById($id);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        return $this->jsonSuccess($user);
    }

    public function getUserByUsername(Request $request, $parameters)
    {
        $username = $parameters['userName'] ?? null;
        if ($username === null || !is_string($username)) {
            return $this->jsonBadRequest("Invalid username");
        }
        $user = $this->users->getUserByUsername($username);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        return $this->jsonSuccess($user);
    }

    public function getUserByEmail(Request $request, $parameters)
    {
        $email = $parameters['email'] ?? null;
        if ($email === null || !is_string($email)) {
            return $this->jsonBadRequest("Invalid email");
        }
        $user = $this->users->getUserByEmail($email);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        return $this->jsonSuccess($user);
    }

    public function getUsers(Request $request, $parameters)
    {
        $allUsers = $this->users->getAllUsers();
        if ($allUsers === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($allUsers);
    }

    public function userLogin(Request $request, $parameters)
    {
        $credential = $request->postParams['usernameOrEmail'] ?? null;
        $password   = $request->postParams['password'] ?? null;
        if ($credential === null || $password === null) {
            return $this->jsonBadRequest("Username/email and password required");
        }
        $user = $this->users->getUserByUsernameOrEmail($credential);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        if (!password_verify($password, $user['password_hash'])) {
            return $this->jsonUnauthorized("Invalid password");
        }
        
        // Generate JWT with two_factor_verified=false (mert)
        $token = generateJWT($user['id'], false);
        setJWTCookie($token);
        
        return $this->jsonSuccess([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'token' => $token
        ]);
    }

    public function newUser(Request $request, $parameters)
    {
        $username = $request->postParams['userName']  ?? null;
        $email    = $request->postParams['email']     ?? null;
        $password = $request->postParams['password']  ?? null;
        // if ($email === null) {
        //     $email = "hard@code.de";
        // }
        $errors = Validator::validateNewUserData($username, $email, $password);
        if ($errors) {
            return $this->jsonBadRequest(json_encode($errors));
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $id = $this->users->createUser($username, $email, $hash);
        if ($id === null) {
            return $this->jsonConflict("Conflicting user info");
        }
        return $this->jsonCreated(['id' => (int)$id]);
    }

    public function deleteUser(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $deleted = $this->users->deleteUser((int)$id);
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
        if ($id === null || !ctype_digit($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $user = $this->users->getUserById((int)$id);
        if ($user === null) {
            return $this->jsonServerError();
        }
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        $old = $request->postParams['oldPassword'] ?? null;
        $new = $request->postParams['newPassword'] ?? null;
        if ($old === null || $new === null) {
            return $this->jsonBadRequest("Both old and new passwords required");
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

    public function updateUser(Request $request, $parameters)
    {
        $id = $request->postParams['id'] ?? null;
        if ($id === null || !ctype_digit($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $existing = $this->users->getUserById((int)$id);
        if ($existing === null) {
            return $this->jsonServerError();
        }
        if (!$existing) {
            return $this->jsonNotFound("User not found");
        }
        $username = $request->postParams['userName'] ?? $existing['username'];
        $email    = $request->postParams['email']    ?? $existing['email'];
        $password = $request->postParams['password'] ?? null;
        $errors = Validator::validateUpdateUserData($username, $email, $password);
        if ($errors) {
            return $this->jsonBadRequest(json_encode($errors));
        }
        $hash = $password ? password_hash($password, PASSWORD_DEFAULT) : $existing['password_hash'];
        $updated = $this->users->updateUserInfo((int)$id, $username, $email, $hash);
        if ($updated === null) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess($updated);
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
}
