<?php

declare(strict_types=1);

// displays errors atm
ini_set("display_errors", 1);

$page = $_GET["page"];

// dirname returns parent directory of a given path
// __DIR__ gives directory of current php file
// modify root dir of the webserver to public so that they cannot be accessed
// --> php -S localhost:8000 -t public 
require dirname(__DIR__) . "/{$page}.php";