<?php

use src\http\Response;
use src\http\HttpStatusCode;

view("contact.view.php");

return new Response(HttpStatusCode::Ok);
