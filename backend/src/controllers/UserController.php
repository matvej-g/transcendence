<?php

namespace src\controllers;

use finfo;
use src\Database;
use src\http\Request;
use src\controllers\BaseController;
use src\Models\UserModel;
use src\Models\UserStatsModel;
use src\Validator;

class UserController extends BaseController
{
    private UserModel $users;
    private UserStatsModel $stats;

    public function __construct(Database $db)
    {
        $this->users = new UserModel($db);
        $this->stats = new UserStatsModel($db);
    }

    public function getUser(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
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
        $user = user_to_public($user);
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
        $user = user_to_public($user);
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
        $user = user_to_public($user);
        return $this->jsonSuccess($user);
    }

    public function getUsers(Request $request, $parameters)
    {
        $allUsers = $this->users->getAllUsers();
        if ($allUsers === null) {
            return $this->jsonServerError();
        }
        $allUsers = array_map('user_to_public', $allUsers);
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
        $user = user_to_public($user);
        return $this->jsonSuccess($user);
    }

    public function newUser(Request $request, $parameters)
    {
        $username = $request->postParams['userName']  ?? null;
        $email    = $request->postParams['email']     ?? null;
        $password = $request->postParams['password']  ?? null;

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
        if (!Validator::validateId($id)) {
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
        if (!Validator::validateId($id)) {
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
        $updated = user_to_public($updated);
        return $this->jsonSuccess($updated);
    }

    public function uploadAvatar(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
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
        if ($user && $user['avatar_filename'] !== 'default.png') {
            @unlink($targetDir . $user['avatar_filename']);
        }
        $updated = $this->users->updateAvatarFilename((int)$id, $filename);
        if (!$updated) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(user_to_public($updated));
    }

    public function deleteAvatar(Request $request, $parameters)
    {
        $id = $parameters['id'] ?? null;
        if (!Validator::validateId($id)) {
            return $this->jsonBadRequest("Invalid id");
        }
        $user = $this->users->getUserById((int)$id);
        if (!$user) {
            return $this->jsonNotFound("User not found");
        }
        $targetDir = '/var/www/html/uploads/avatars/'; 
        if ($user['avatar_filename'] !== 'default.png') {
            @unlink($targetDir . $user['avatar_filename']);
        }
        $updated = $this->users->updateAvatarFilename((int)$id, 'default.png');
        if (!$updated) {
            return $this->jsonServerError();
        }
        return $this->jsonSuccess(user_to_public($updated));
    }
}
