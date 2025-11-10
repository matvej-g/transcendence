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