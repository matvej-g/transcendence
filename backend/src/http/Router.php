<?php

namespace src\http;

class Router {

	protected $routes = [];

	protected function add($method, $uri, $controller)
	{
		$this->routes[] = [
			'uri' => $uri,
			'method' => $method,
			'controller' => $controller,
		];
	}

	public function get($uri, $controller)
	{
		$this->add('GET', $uri, $controller);
	}

	public function post($uri, $controller)
	{
		$this->add('POST', $uri, $controller);
	}

	public function delete($uri, $controller)
	{
		$this->add('DELETE', $uri, $controller);
	}
	
	public function patch($uri, $controller)
	{
		$this->add('PATCH', $uri, $controller);
	}

	public function put($uri, $controller)
	{
		$this->add('PUT', $uri, $controller);
	}


	public function convert($route, $uri)
	{
		//  extracts {id} from route['uri'] and stores it inside the capture group 1
		// 	replacing with regex expression for matching one or more characters after a slash
		//  that capture group inside the string is named after the value that we have replaced it with which is id

		// dump('uri: '.$uri);
		// dump('route: '.$route['uri']);
		$pattern = preg_replace('/\{(\w+)\}/', '(?P<\1>[^/]+)', $route['uri']);
		$pattern = "#^" . $pattern . "$#";
		// dump('pattern:'.$pattern);
		if (preg_match($pattern, $uri, $matches)) {
			return $matches;
		}
		return false;
		// convert /api/user/{id} to regular expression
		//  /api/user/{id}
		// match regular expression
	}


	public function route($uri, $method, $request, $db): Response
	{
		foreach ($this->routes as $route) {
			$matches = $this->convert($route, $uri);
			if ($matches !== false && $matches[0] === $uri && $route['method'] === strtoupper($method)) {
			// static page controllers
			if (is_string($route['controller']))
				return require base_path($route['controller']);
			// dynamic controller classes
			if (is_array($route['controller'])) {
				[$class, $methodName] = $route['controller'];
				
				// creating a Controller because $class holds name of controller
				$controllerInstance = new $class($db);
				// calling the method because $methodName holds the name of the method
				return ($controllerInstance->$methodName($request, $matches));
			}
			}
		}
		$this->abort();
	}

	protected function abort()
	{
		http_response_code(404);
		echo "Sorry, Not found.";
		die(0);
	}
}