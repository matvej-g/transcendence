<?php

use src\controllers\UserController;

// pages
$this->router->get('/', 'src/controllers/home.php');
$this->router->get('/about', 'src/controllers/about.php');
$this->router->get('/contact', 'src/controllers/contact.php');
$this->router->get('/game', 'src/controllers/game.php');

// Database
// $this->router->post('/register', [UserController::class, 'register']);
$this->router->get('/users/show', [UserController::class, 'showUsers']);
$this->router->post('/users/add', [UserController::class, 'addUser']);
