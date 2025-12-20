<?php

// load from base path
function base_path($path) {
	return BASE_PATH . $path;
}

// load view paths
function view($path)
{
	require base_path('views/' . $path);
}

/**
 * Transform a full user DB row into a public-safe representation.
 *
 * Currently removes password_hash; extend if you add more internal fields.
 */
function user_to_public(array $user): array
{
	if (array_key_exists('password_hash', $user)) {
		unset($user['password_hash']);
	}

	return $user;
}
