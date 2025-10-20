<?php

// prevents silent type conversions
declare(strict_types=1);

// makes source code more secure as it is no accessable from the outside
require dirname(__DIR__) . "/framework/http/Request.php";
require dirname(__DIR__) . "/framework/http/Response.php";
require dirname(__DIR__) . "/framework/http/Kernel.php";


$request = Request::createFromGlobals();
// print_r($request->getParams);
// print_r($request->postParams);


// print_r($request->server);



$kernel = new Kernel();
$response = $kernel->handle($request);

$response->send();