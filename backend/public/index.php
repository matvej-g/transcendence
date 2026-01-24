<?php

declare(strict_types=1);
use src\http\Kernel;
use src\http\Request;

const BASE_PATH = __DIR__ . '/../';
require BASE_PATH . 'src/helpers/functions.php';
require BASE_PATH . 'src/helpers/2faHelpers.php';
require BASE_PATH . 'src/helpers/jwtHelpers.php';
require base_path("vendor/autoload.php");

spl_autoload_register(function ($class) {
	$class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
	require base_path($class . '.php');
});

$request = Request::createFromGlobals();

$kernel = new Kernel();
$response = $kernel->handle($request);


$response->send();
