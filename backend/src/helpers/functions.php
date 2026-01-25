<?php

function base_path($path) {
	return BASE_PATH . $path;
}

// remove later
function view($path)
{
	require base_path('views/' . $path);
}

// Get current authenticated user ID from JWT (requires AuthMiddleware)
function getCurrentUserId($request): ?int
{
	return isset($request->user['user_id']) ? (int)$request->user['user_id'] : null;
}

// Get full JWT payload from authenticated user
function getCurrentUser($request): ?array
{
	return $request->user ?? null;
}

function userToPublic(array $user): array
{
	if (array_key_exists('password_hash', $user)) {
		unset($user['password_hash']);
	}

	return $user;
}

function stripEmail(array $user): array
{
	if (array_key_exists('email', $user)) {
		unset($user['email']);
	}

	return $user;
}

function stripPersonalData(array $user): array
{
	$user = userToPublic($user);
	$user = stripEmail($user);
	
	if (array_key_exists('oauth_id', $user)) {
		unset($user['oauth_id']);
	}

	if (array_key_exists('two_factor_code', $user)) {
		unset($user['two_factor_code']);
	}

	if (array_key_exists('two_factor_expires_at', $user)) {
		unset($user['two_factor_expires_at']);
	}
	
	if (array_key_exists('two_factor_enabled', $user)) {
		unset($user['two_factor_enabled']);
	}

	if (array_key_exists('created_at', $user)) {
		unset($user['created_at']);
	}

	return $user;
}