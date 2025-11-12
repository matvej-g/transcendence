<?php

use src\http\Response;
use src\http\HttpStatusCode;

// Require JWT and ensure 2FA verified
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
if (empty($payload['two_factor_verified']) || $payload['two_factor_verified'] !== true) {
    header('Location: /verify-2fa');
    exit;
}

$content = "
    <!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Dashboard</title>
        <link rel='stylesheet' href='/style.css'>
    </head>
    <body>
        <div class='container'>
            <h1>✅ Dashboard</h1>
            <p>Welcome! You've successfully verified with 2FA + JWT.</p>
            <p><strong>User ID:</strong> {$payload['user_id']}</p>
            <p><strong>2FA Status:</strong> Verified ✓</p>
            <p><strong>JWT Expires:</strong> " . date('Y-m-d H:i:s', $payload['exp']) . "</p>
            <p><a href='/send-2fa'>Send 2FA again</a></p>
        </div>
    </body>
    </html>
";

return new Response(HttpStatusCode::Ok, $content);