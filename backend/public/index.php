<?php
// prevents silent type conversions
declare(strict_types=1);

require '../vendor/autoload.php';

use function Symfony\Component\VarDumper\dd;

// makes source code more secure as it is no accessable from the outside
require dirname(__DIR__) . "/src/http/Request.php";
require dirname(__DIR__) . "/src/http/Response.php";
require dirname(__DIR__) . "/src/http/Kernel.php";
require dirname(__DIR__) . "/src/Database.php";



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