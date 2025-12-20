<?php

function base_path($path) {
	return BASE_PATH . $path;
}

// remove later
function view($path)
{
	require base_path('views/' . $path);
}

function user_to_public(array $user): array
{
	if (array_key_exists('password_hash', $user)) {
		unset($user['password_hash']);
	}

	return $user;
}
