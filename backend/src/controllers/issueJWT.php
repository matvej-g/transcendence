<?php

use src\http\Response;
use src\http\HttpStatusCode;

// Issue a JWT for testing.
// Pass ?user=2 to issue for user id 2 (or change default below)
$defaultUserId = 2;
$userId = isset($_GET['user']) ? (int)$_GET['user'] : $defaultUserId;

// Basic check: ensure user exists
$db = new src\Database('sqlite:/var/www/html/database/transcendence.db');
$userModel = new src\Models\UserModel($db);
$user = $userModel->getUserById($userId);
if (!$user) {
    $content = "<h1>User not found</h1><p>User ID: {$userId} does not exist.</p>";
    return new Response(HttpStatusCode::Ok, $content);
}

$token = generateJWT($userId, false, 3600);
setJWTCookie($token, 3600);

$content = "
    <h1>JWT Issued</h1>
    <p>User ID: {$userId}</p>
    <p>Token (also set as cookie):</p>
    <pre>{$token}</pre>
    <p><a href='/send-2fa'>Send 2FA for this user</a></p>
    <p><a href='/verify-2fa'>Go to verify</a></p>
";
return new Response(HttpStatusCode::Ok, $content);