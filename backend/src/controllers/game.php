<?php

use src\http\Response;
use src\http\HttpStatusCode;

view("game.view.php");

return new Response(HttpStatusCode::Ok);
