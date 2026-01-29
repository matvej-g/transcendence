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
        $fromEmail = getenv('SMTP_FROM_EMAIL');
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

/**
 * Send a 2FA verification code via SMS.
 * Currently a placeholder that logs the code — replace the body
 * with a real SMS API call (e.g. curl to Twilio REST API) when ready.
 */
function sendTwoFactorSMS($phoneNumber, $code) {
	$sid   = getenv('TWILIO_SID');
	$token = getenv('TWILIO_AUTH_TOKEN');
	$from  = getenv('TWILIO_PHONE_NUMBER');

	if (!$sid || !$token || !$from) {
		error_log("SMS 2FA failed: Twilio credentials not configured");
		return false;
	}

	$ch = curl_init("https://api.twilio.com/2010-04-01/Accounts/$sid/Messages.json");
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_USERPWD, "$sid:$token");
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
		'To'   => $phoneNumber,
		'From' => $from,
		'Body' => "Your Transcendence verification code is: $code"
	]));
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$response = curl_exec($ch);
	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$error    = curl_error($ch);
	curl_close($ch);

	if ($error) {
		error_log("SMS 2FA curl error: $error");
		return false;
	}

	if ($httpCode >= 200 && $httpCode < 300) {
		return true;
	}

	error_log("SMS 2FA failed (HTTP $httpCode): $response");
	return false;
}
