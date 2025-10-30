<?php

use src\http\Response;
use src\http\HttpStatusCode;

view("home.view.php");

return new Response(HttpStatusCode::Ok);
