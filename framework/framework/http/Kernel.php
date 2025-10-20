<?php

class Kernel
{

	public function handle(Request $request): Response
	{
		$content = '<h1>Hello World</h1>';
		echo "\n";
		$uri = $request->getUri();

		$routes = [
			'/' => "call controller",
			'/home.php' => "call controller2",
		];

		if (!isset($routes[$uri]))
		{
			$content = '<h1>404 Not found</h1>';
			$status = 404;
		}
		else
		{
			$controller = $routes[$uri];
			$content = "<p>Dispatching to controller: {$controller}</p>";
			$status = 200;
		}

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