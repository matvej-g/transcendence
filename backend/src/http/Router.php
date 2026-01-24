<?php

namespace src\http;

class Router {

    protected $routes = [];

	protected function add($method, $uri, $controller, $middleware = [])
	{
		$this->routes[] = [
			'uri' => $uri,
			'method' => $method,
			'controller' => $controller,
			'middleware' => $middleware,
		];
	}

	public function get($uri, $controller, $middleware = [])
	{
		$this->add('GET', $uri, $controller, $middleware);
	}

	public function post($uri, $controller, $middleware = [])
	{
		$this->add('POST', $uri, $controller, $middleware);
	}

    public function delete($uri, $controller, $middleware = [])
    {
		$this->add('DELETE', $uri, $controller, $middleware);
    }
    
    public function patch($uri, $controller, $middleware = [])
    {
		$this->add('PATCH', $uri, $controller, $middleware);
    }

    public function put($uri, $controller, $middleware = [])
    {
		$this->add('PUT', $uri, $controller, $middleware);
    }

    private function convert($route, $uri)
    {
        $pattern = preg_replace_callback('/\{(\w+)\}/', function ($m) {
            $name = $m[1];
            // enforce numeric-only for {id}
            if ($name === 'id') {
                return '(?P<' . $name . '>\d+)';
            }
            // enforce basic email format for {email}
            if ($name === 'email') {
                return '(?P<' . $name . '>[^/@]+@[^/]+)';
            }
            // default: match any non-slash segment
            return '(?P<' . $name . '>[^/]+)';
        }, $route['uri']);

        $pattern = "#^" . $pattern . "$#";
        if (preg_match($pattern, $uri, $matches)) {
            return $matches;
        }
        return false;
    }

	public function route($uri, $method, $request, $db): Response
	{
		foreach ($this->routes as $route) {
			$matches = $this->convert($route, $uri);
			if ($matches !== false && $matches[0] === $uri && $route['method'] === strtoupper($method)) {
				
				// Run middleware before controller
				if (!empty($route['middleware'])) {
					foreach ($route['middleware'] as $middleware) {
						$middlewareResponse = call_user_func([$middleware, 'handle'], $request);
						if ($middlewareResponse !== null) {
							return $middlewareResponse;
						}
					}
				}

				if (is_array($route['controller'])) {
					[$class, $methodName] = $route['controller'];
					
					$controllerInstance = new $class($db);
					return ($controllerInstance->$methodName($request, $matches));
				}
			}
		}
		return new Response(HttpStatusCode::NotFound, "Requested api not found", ['Content-Type' => 'application/json']);
	}
}
