<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendTwoFactorEmail($email, $code) {

	// error_log("=== 2FA code for $email: $code ===");	//
	// $_SESSION['test_2fa_code'] = $code;					// for testing
	// return true;										//


	$mail = new PHPMailer(true);

    try {
        // Server settings from environment
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USERNAME');
        $mail->Password = getenv('SMTP_PASSWORD');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = (int)(getenv('SMTP_PORT'));

        // Fix for Docker Desktop on Windows/Mac - SSL certificate validation issues
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        // Recipients
        $fromEmail = getenv('SMTP_FROM_EMAIL') ;
        $fromName = getenv('SMTP_FROM_NAME');
        $mail->setFrom($fromEmail, $fromName);
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
