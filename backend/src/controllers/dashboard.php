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
        <style>
            .jwt-box {
                background: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                word-wrap: break-word;
                font-family: monospace;
                font-size: 12px;
            }
            .jwt-payload {
                background: #e8f5e9;
                padding: 10px;
                border-radius: 5px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>✅ Dashboard</h1>
            <p>Welcome! You've successfully verified with 2FA + JWT.</p>
            
            <h2>User Info</h2>
            <p><strong>User ID:</strong> {$payload['user_id']}</p>
            <p><strong>2FA Status:</strong> ✓ Verified</p>
            <p><strong>JWT Issued:</strong> " . date('Y-m-d H:i:s', $payload['iat']) . "</p>
            <p><strong>JWT Expires:</strong> " . date('Y-m-d H:i:s', $payload['exp']) . "</p>
            
            <h2>JWT Token</h2>
            <div class='jwt-box'>
                <strong>Token:</strong><br>
                $token
            </div>
            
            <h2>JWT Payload (Decoded)</h2>
            <div class='jwt-payload'>
                <pre>" . json_encode($payload, JSON_PRETTY_PRINT) . "</pre>
            </div>
            
            <p><a href='/send-2fa'>Test 2FA Again</a></p>
        </div>
    </body>
    </html>
";

return new Response(HttpStatusCode::Ok, $content);