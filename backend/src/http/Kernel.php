<?php

namespace src\http;

class Kernel
{

	public function handle(Request $request): Response
	{
		$content = '<h1>Hello World</h1>';
		// echo "\n";
		
		$router = new Router();

		// extract the value without query string from url under key path
		$uri = parse_url($request->getUri())['path'];		
		
		$method = $request->getMethod();

		$router->get('/', 'src/controllers/home.php');
		$router->get('/about', 'src/controllers/about.php');
		$router->get('/contact', 'src/controllers/contact.php');

		$router->route($uri, $method);

		// extract query string 
		// $query = parse_url($request->getUri())['query'];

		// dispatcher

		return (new Response($content));
	}
}

// dispatcher is responsible for
// figuring out which controller or function should handle a given request
// invoking that controller with the right arguments
// returning the result (reponse object) back to the kernel
// 