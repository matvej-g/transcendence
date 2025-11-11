<?php

use src\http\Response;
use src\http\HttpStatusCode;

// Check if 2FA was verified
if (!isset($_SESSION['2fa_verified']) || !$_SESSION['2fa_verified']) {
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
            <p>Welcome! You've successfully verified with 2FA.</p>
            <p><strong>User ID:</strong> {$_SESSION['user_id']}</p>
            <p><strong>2FA Status:</strong> Verified ✓</p>
            <p><a href='/send-2fa'>Test 2FA Again</a></p>
        </div>
    </body>
    </html>
";

return new Response(HttpStatusCode::Ok, $content);