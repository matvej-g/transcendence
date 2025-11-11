<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Verify 2FA Code</title>
	<link rel="stylesheet" href="/style.css">
</head>
<body>
	<div class="container">
		<h1>Two-Factor Authentication</h1>
		<p>A 6-digit code has been sent to your email.</p>
        
		<?php if (isset($error)): ?>
			<div class="error"><?= htmlspecialchars($error) ?></div>
		<?php endif; ?>

		<form method="POST" action="/verify-2fa">
			<div class="form-group">
				<label for="code">Enter Code:</label>
				<input 
					type="text" 
					id="code" 
					name="code" 
					maxlength="6" 
					pattern="\d{6}" 
					required 
					autofocus
					placeholder="000000"
				>
			</div>
            
			<button type="submit">Verify</button>
		</form>

		<p><a href="/send-2fa">Resend Code</a></p>
	</div>
</body>
</html>