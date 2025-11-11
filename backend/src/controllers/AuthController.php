<?php

namespace src\Controllers;

use src\Database;
use src\Models\UserModels;
use src\http\Response;
use src\http\HttpStatusCode;

class AuthController
{
	private $userModel;

	public function __construct(Database $db)
	{
		$this->userModel = new UserModels($db);
	}

	public function sendTwoFactorCode()
	{
		// Check if user is logged in
		// if (!isset($_SESSION['user_id'])) {
		//     header('Location: /login');
		//     exit;
		// }

		$_SESSION['user_id'] = 2;

		$code = str_pad((string)rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
		$expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

		$user = $this->userModel->findUserById($_SESSION['user_id']);

		$this->userModel->saveTwoFactorCode($_SESSION['user_id'], $code, $expiresAt);

		sendTwoFactorEmail($user['email'], $code);

		header('Location: /verify-2fa');
		exit;
	}

	public function verifyTwoFactorCode()
	{
		// // Check if user is logged in
		// if (!isset($_SESSION['user_id'])) {
		//     header('Location: /login');
		//     exit;
		// }

		// TEMPORARY: Set user ID for testing
		if (!isset($_SESSION['user_id']))
		{
			$_SESSION['user_id'] = 2;
		}

		if ($_SERVER['REQUEST_METHOD'] === 'POST')
		{
			$code = $_POST['code'] ?? '';

			if ($this->userModel->verifyTwoFactorCode($_SESSION['user_id'], $code))
			{
				$_SESSION['2fa_verified'] = true;
				header('Location: /dashboard');
				exit;
			}
			else
			{
				$error = 'Invalid or expired code';
			}
		}

		ob_start();
		require base_path('views/verify-2fa.view.php');
		$content = ob_get_clean();
        
		return new Response(HttpStatusCode::Ok, $content);
	}
}