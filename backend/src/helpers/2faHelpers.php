<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendTwoFactorEmail($email, $code) {
    
	// error_log("=== 2FA code for $email: $code ===");	//
	// $_SESSION['test_2fa_code'] = $code;					// for testing
	// return true;										//


	$mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'mertcode55@gmail.com'; // TODO: Replace with your email
        $mail->Password = 'hgzl wozx jhgc msnu';     // TODO: Replace with your app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('mertcode55@gmail.com', 'Transcendence 2FA'); // TODO: Replace
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Your 2FA Verification Code';
        $mail->Body = "
            <h2>Two-Factor Authentication</h2>
            <p>Your verification code is:</p>
            <h1 style='color: #4CAF50; font-size: 32px;'>$code</h1>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email sending failed: {$mail->ErrorInfo}");
        return false;
    }
}
