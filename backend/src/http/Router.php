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


	public function route($uri, $method, $request, $db): Response
	{
		foreach ($this->routes as $route) {
			if ($route['uri'] === $uri && $route['method'] === strtoupper($method)) {
				
			// static page controllers
			if (is_string($route['controller']))
				return require base_path($route['controller']);
			
			// dynamic controller classes
			if (is_array($route['controller'])) {
				[$class, $methodName] = $route['controller'];
				
				// creating a Controller because $class holds name of controller
				$controllerInstance = new $class($db);
				// calling the method because $methodName holds the name of the method
				return ($controllerInstance->$methodName($request));
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