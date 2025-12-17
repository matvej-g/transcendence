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

    // Convert a route URI with placeholders into a regex pattern,
    // handling multiple placeholders and restricting {id} to digits.
    // Returns an array of matches (named and numeric) or false.
    public function convert($route, $uri)
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
                // static page controllers
                if (is_string($route['controller'])) {
                    return require base_path($route['controller']);
                }
                // dynamic controller classes
                if (is_array($route['controller'])) {
                    [$class, $methodName] = $route['controller'];
                    $controllerInstance = new $class($db);
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
