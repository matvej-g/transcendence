<?php
// prevents silent type conversions
declare(strict_types=1);
use src\Database; // alias full namespace: makes it possible to use class name alone
use src\http\Kernel;
use src\http\Request;


// one dir above public
const BASE_PATH = __DIR__ . '/../';
require BASE_PATH . 'src/helpers/functions.php';
// for dump()
require base_path("vendor/autoload.php");

// runs only when PHP tries to instantiate a class that hasn’t been loaded yet
// converts class name (like Database) into a file path
spl_autoload_register(function ($class) {
	$class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
	require base_path($class . '.php');
});

$request = Request::createFromGlobals();


$db = new Database("sqlite:../src/intro.db");


// $id = $request->getParams['id'];
// $query = "SELECT * FROM users where id = ?";
// // dump($query);

// $users = $db->query($query, [$id])->fetch(PDO::FETCH_ASSOC);

// dump($users);
// die();



$kernel = new Kernel();
$response = $kernel->handle($request);

$response->send();