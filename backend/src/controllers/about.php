<?php

use src\http\Response;
use src\http\HttpStatusCode;

view("about.view.php");

return new Response(HttpStatusCode::Ok);
