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