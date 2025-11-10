<?php

use src\controllers\UserController;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');
$this->router->get('/game', 'src/controllers/game.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/api/users', [UserController::class, 'getUsers']);
$this->router->get('/api/user/{id}', [UserController::class, 'getUser']); // not working need proper handling of variable input
$this->router->get('/api/users/register', [UserController::class, 'registerUser']); // change to post

// $router->group('/api/user', function($r){

// });
