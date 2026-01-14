<?php
// prevents silent type conversions
declare(strict_types=1);
use src\http\Kernel;
use src\http\Request;

// one dir above public
const BASE_PATH = __DIR__ . '/../';
require BASE_PATH . 'src/helpers/functions.php';
require BASE_PATH . 'src/helpers/2faHelpers.php';
require BASE_PATH . 'src/helpers/jwtHelpers.php';
// for dump() and composer packages
require base_path("vendor/autoload.php");

// runs only when PHP tries to instantiate a class that hasn't been loaded yet
// converts class name (like Database) into a file path
spl_autoload_register(function ($class) {
	$class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
	require base_path($class . '.php');
});

$request = Request::createFromGlobals();

$kernel = new Kernel();
$response = $kernel->handle($request);


$response->send();
