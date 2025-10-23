<?php

class Kernel
{

	public function handle(Request $request): Response
	{
		$content = '<h1>Hello World</h1>';
		echo "\n";
		$uri = $request->getUri();

		// extract the value without query string from url under key path
		parse_url($request->getUri())['path'];
		$routes = [
			'/' => '../src/controllers/home.php',
			'/about' => '../src/controllers/about.php',
			'/contact' => '../src/controllers/contact.php',
		];



		// dump($uri);
		// dump($routes['/']);
		// dump(parse_url($request->getUri())['path']);
		// die(1);
		// dump($routes[$uri]);
		// die(1);

		if (array_key_exists($uri, $routes)) {
			require $routes[$uri]; 
		}
		else {
			http_response_code(404);
			echo "Sorry, Not found.";
			die(0);
		}

		// if (!isset($routes[$uri]))
		// {
		// 	$content = '<h1>404 Not found</h1>';
		// 	$status = 404;
		// }
		// else
		// {
		// 	$controller = $routes[$uri];
		// 	$content = "<p>Dispatching to controller: {$controller}</p>";
		// 	$status = 200;
		// }

		// router
		// 	match the path to a page
		// dispatcher

		return (new Response($content));
	}
}

// dispatcher is responsible for
// figuring out which controller or function should handle a given request
// invoking that controller with the right arguments
// returning the result (reponse object) back to the kernel
// 