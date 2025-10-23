<?php
// prevents silent type conversions
declare(strict_types=1);


// makes source code more secure as it is no accessable from the outside
require dirname(__DIR__) . "/framework/http/Request.php";
require dirname(__DIR__) . "/framework/http/Response.php";
require dirname(__DIR__) . "/framework/http/Kernel.php";

require 'Database.php';


$request = Request::createFromGlobals();

$db = new Database("sqlite:../../intro.db");

// $id = $request->getParams['id'];
// $query = "SELECT * FROM users where id = ?";
// // dump($query);

// $users = $db->query($query, [$id])->fetch(PDO::FETCH_ASSOC);

// dump($users);
// die();



$kernel = new Kernel();
$response = $kernel->handle($request);

$response->send();